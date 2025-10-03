
const PdfPrinter = require('pdfmake');
const path = require('path');
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};
const printer = new PdfPrinter(fonts);
const supabase = require("../services/supabase");

// Função para formatar horas decimais
function formatDecimalHours(decimalHours) {
  if (!decimalHours || decimalHours === 0) return "0h 0min";
  
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  
  if (hours === 0) {
    return `${minutes}min`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}min`;
  }
}

async function generatePDF(userData, activities, tipoAtividade) {
  const titulo =
    tipoAtividade === "extensao"
      ? "FICHA DE AVALIAÇÃO DE ATIVIDADES DE EXTENSÃO"
      : "FICHA DE AVALIAÇÃO DE ATIVIDADES COMPLEMENTARES";

  // Garantir que o semestre seja tratado corretamente
  const semestre = userData?.semestre_entrada || "Não informado";
  // Recupera os nomes das atividades a partir do tipo_id
  const activityTypes = await Promise.all(
    activities.map(async (act) => {
      const { data: activityTypeData, error } = await supabase
        .from("activity_types")
        .select("nome")
        .eq("id", act.tipo_id)
        .single();
      if (error || !activityTypeData) {
        return "Nome não definido";
      }
      return activityTypeData.nome || "Nome não definido";
    })
  );

  const docDefinition = {
    defaultStyle: { font: 'Helvetica' },
    content: [
      {
        text: "UNIVERSIDADE DO ESTADO DE MINAS GERAIS – UEMG",
        style: "header",
      },
      { text: "CURSO DE ENGENHARIA DE COMPUTAÇÃO", style: "subheader" },
      { text: titulo, style: "title" },
      { text: "\nEstudante: " + (userData?.nome || "Nome não informado"), style: "text" },
      { text: "Matrícula: " + (userData?.matricula || "Matrícula não informada"), style: "text" },
      { text: "Turno: " + (userData?.turno || "Turno não informado"), style: "text" },
      { text: "Ano/Semestre de Entrada: " + (userData?.semestre_entrada || "Semestre não informado"), style: "text" },

      { text: "\n\n", style: "text" },

      // Atividades de Extensão ou Complementares
      {
        text:
          tipoAtividade === "extensao"
            ? "Atividades de Extensão (A)"
            : "Atividades de Ensino (B)",
        style: "sectionHeader",
      },
      {
        table: {
          headerRows: 1,
          widths: ["50%", "25%", "25%"],
          body: [
            [
              { text: "Atividade", style: "tableHeader" },
              { text: "Quantidade", style: "tableHeader" },
              { text: "*Total", style: "tableHeader" },
            ],
            ...activities.map((act, index) => [
              activityTypes[index] || "Atividade não definida", // Atividade
              formatDecimalHours(act.horas || 0), // Quantidade
              formatDecimalHours(act.horas || 0), // Total
            ]),
          ],
        },
      },

      { 
        text: `Subtotal: ${formatDecimalHours(activities.reduce((sum, act) => sum + (act.horas || 0), 0))} (${tipoAtividade === "extensao" ? "405h" : "150h"})`, 
        style: "subtotal" 
      },

      { text: "\n\n", style: "text" },

      // Linha para Assinatura e Data com alinhamento correto
      {
        table: {
          widths: ["50%", "50%"],
          body: [
            [
              {
                text: "________________________________________",
                alignment: "center",
                margin: [0, 10],
              },
              {
                text: "________________________________________",
                alignment: "center",
                margin: [0, 10],
              },
            ],
            [
              { text: "Local e Data", alignment: "center", style: "text" },
              { text: "Assinatura", alignment: "center", style: "text" },
            ],
          ],
        },
        layout: "noBorders", // Remove bordas da tabela
      },
    ],
    styles: {
      header: { fontSize: 14, bold: true, alignment: "center" },
      subheader: { fontSize: 12, bold: true, alignment: "center" },
      title: { fontSize: 12, bold: true, margin: [0, 10], alignment: "center" },
      text: { fontSize: 10 },
      line: { fontSize: 10, margin: [0, 10], alignment: "center" },
      sectionHeader: { fontSize: 11, bold: true, margin: [0, 10] },
      tableHeader: { bold: true, fontSize: 10, fillColor: "#fff" },
      subtotal: {
        bold: true,
        fontSize: 10,
        margin: [0, 10],
        alignment: "right",
      },
    },
  };

  // Para uso em API, retornar o buffer do PDF (Node.js)
  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    pdfDoc.on('data', (chunk) => chunks.push(chunk));
    pdfDoc.on('end', () => {
      const result = Buffer.concat(chunks);
      resolve(result);
    });
    pdfDoc.end();
  });
}

module.exports = generatePDF;
