const jwt = require("jsonwebtoken");
const authService = require("../services/authService");
const supabase = require("../services/supabase");

exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    // Opcional: validar senha atual (não obrigatório no Supabase, mas recomendado)
    // Tenta login com a senha atual
    const { success } = await require("../services/authService").login(
      req.user.email,
      currentPassword
    );
    if (!success) {
      return res.status(401).json({ message: "Senha atual incorreta." });
    }
    // Altera a senha no Supabase Auth
    const { error } = await require("../services/supabase").auth.updateUser({
      password: newPassword,
    });
    if (error) return res.status(400).json({ message: error.message });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const result = await authService.login(email, senha);
    if (result.success) {
      // Gerar JWT
      const secret = process.env.JWT_SECRET;
      const token = jwt.sign(
        { id: result.user.id, role: result.role },
        secret,
        { expiresIn: "8h" }
      );

      // Registrar log de login
      const deviceInfo = req.headers["user-agent"] || "";
      const ipAddress =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress || "";
      await supabase.from("login_logs").insert([
        {
          user_id: result.user.id,
          device_info: deviceInfo,
          ip_address: ipAddress,
          location: "", // opcional, pode preencher depois
          login_time: new Date().toISOString(),
        },
      ]);

      res.json({ ...result, token });
    } else {
      res.status(401).json({ message: result.message });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro interno no login", error: error.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const userData = req.body;
    const result = await authService.signup(
      userData.email,
      userData.senha,
      userData.nome,
      userData.matricula,
      userData.turno,
      userData.semestre_entrada,
      userData.role
    );
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro interno no cadastro", error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, nome, email, role, matricula, turno, semestre_entrada, created_at, last_login, url_profile, phone"
      )
      .eq("id", userId)
      .single();
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erro ao buscar dados do usuário",
        error: error.message,
      });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Detectar automaticamente a URL baseada no ambiente
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://horas-complementares.vercel.app'
      : 'http://localhost:3000';
    
    const redirectUrl = `${baseUrl}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    
    if (error) return res.status(400).json({ message: error.message });
    res.json({ success: true, message: 'Email de recuperação enviado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no envio de email', error: error.message });
  }
};
