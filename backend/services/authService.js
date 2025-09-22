const supabase = require("./supabase");
const { validatePassword, validateEmail } = require("../lib/validation");


// Função para criar conta (Signup)
async function signup(
  email,
  senha,
  nome,
  matricula,
  turno,
  semestre_entrada,
  role = "aluno"
) {
  try {
    // Validações
    if (!validateEmail(email)) {
      return { success: false, message: "Email inválido" };
    }

    const passwordValidation = validatePassword(senha);
    if (!passwordValidation.isValid) {
      return { 
        success: false, 
        message: "Senha inválida", 
        errors: passwordValidation.errors 
      };
    }

    // Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: String(email).trim(),
      password: String(senha).trim(),
      options: {
        data: {
          role: role
        }
      }
    });

    if (error) {
      return { success: false, message: error.message };
    }

    // Verificar se o usuário foi criado corretamente
    if (!data?.user?.id) {
      return { success: false, message: "Erro ao obter ID do usuário." };
    }

    const userId = data.user.id;

    // Inserir os dados adicionais do usuário na tabela "users"
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: userId,
        email: String(email).trim(),
        nome: String(nome).trim(),
        matricula: String(matricula).trim(),
        turno: String(turno).trim(),
        semestre_entrada: Number(semestre_entrada),
        role: String(role).trim(),
        created_at: new Date().toISOString(),
        last_login: null
      },
    ]);

    if (insertError) {
      return { success: false, message: "Erro ao salvar dados do usuário." };
    }



    return { success: true, user: data.user };
  } catch (error) {
    console.error("Erro no signup:", error);
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
};

// Função para login usando Supabase Auth
async function login(email, senha) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(senha).trim(),
    });
    if (error) {
      return { success: false, message: error.message };
    }
    // Buscar a role do usuário no banco de dados
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("email", email)
      .single();
    if (userError) {
      return { success: false, message: userError.message };
    }
    // Atualizar último login
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("email", email);
    return { success: true, user: data.user, role: userData?.role || "aluno" };
  } catch (error) {
    console.error("Erro no login:", error);
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
};

// Função para logout
async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Limpa o localStorage ao deslogar
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");

    return { success: true };
  } catch (error) {
    console.error("Erro no logout:", error);
    return { success: false, message: error.message };
  }
};

// Função para obter usuário autenticado e garantir que a role está atualizada
async function getUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return { success: false, message: error.message };

    if (!data.user)
      return { success: false, message: "Usuário não autenticado." };

    // Buscar a role atualizada no banco
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id) // Buscando pelo ID do usuário
      .single();

    if (roleError) return { success: false, message: roleError.message };

    const userRole = userData?.role || "aluno";



    return { success: true, user: data.user, role: userRole };
  } catch (error) {
    console.error("Erro ao obter usuário:", error);
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
};

module.exports = { signup, login, logout, getUser };
