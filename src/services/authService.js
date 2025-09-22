// Função para criar conta (Signup)
import { supabase } from "./supabase";
import { validatePassword, validateEmail } from "../lib/validation";

// Constantes para rate limiting
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos em milissegundos

// Armazenamento local para controle de tentativas de login
const getLoginAttempts = () => {
  const attempts = localStorage.getItem("loginAttempts");
  return attempts ? JSON.parse(attempts) : { count: 0, timestamp: Date.now() };
};

const updateLoginAttempts = (success) => {
  if (success) {
    localStorage.removeItem("loginAttempts");
  } else {
    const attempts = getLoginAttempts();
    attempts.count += 1;
    attempts.timestamp = Date.now();
    localStorage.setItem("loginAttempts", JSON.stringify(attempts));
  }
};

const isAccountLocked = () => {
  const attempts = getLoginAttempts();
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    const timeElapsed = Date.now() - attempts.timestamp;
    if (timeElapsed < LOCKOUT_TIME) {
      return true;
    } else {
      // Reset após o período de bloqueio
      localStorage.removeItem("loginAttempts");
      return false;
    }
  }
  return false;
};

// Função para criar conta (Signup)
export const signup = async (
  email,
  senha,
  nome,
  matricula,
  turno,
  semestre_entrada,
  role = "aluno" // Define "aluno" como padrão
) => {
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

    // Salva o token de autenticação e a role no localStorage
    if (data?.session?.access_token) {
      localStorage.setItem("authToken", data.session.access_token);
      localStorage.setItem("userRole", role); // Salva a role do usuário
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Erro no signup:", error);
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
};

// Função para login usando Supabase Auth
export const login = async (email, senha) => {
  try {
    // Verificar se a conta está bloqueada
    if (isAccountLocked()) {
      return { 
        success: false, 
        message: "Conta temporariamente bloqueada. Tente novamente mais tarde." 
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(senha).trim(),
    });

    if (error) {
      updateLoginAttempts(false);
      return { success: false, message: error.message };
    }

    // Login bem sucedido
    updateLoginAttempts(true);

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

    // Salva o token de autenticação e a role no localStorage
    if (data?.session?.access_token) {
      localStorage.setItem("authToken", data.session.access_token);
      localStorage.setItem("userRole", userData?.role || "aluno");
    }

    return { success: true, user: data.user, role: userData?.role || "aluno" };
  } catch (error) {
    console.error("Erro no login:", error);
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
};

// Função para logout
export const logout = async () => {
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
export const getUser = async () => {
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

    // Atualiza no localStorage para garantir sincronização
    localStorage.setItem("userRole", userRole);

    return { success: true, user: data.user, role: userRole };
  } catch (error) {
    console.error("Erro ao obter usuário:", error);
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
};
