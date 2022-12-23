import { Router, Request, Response } from "express";
import { prismaClient } from "./databases/prismaClient";
import PDFPrinter from "pdfmake";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import fs from "fs";
import { text } from "stream/consumers";
// import PdfPrinter from "pdfmake";

const routes = Router();

routes.get("/products", async (request: Request, response: Response) => {
  const products = await prismaClient.products.findMany();
  return response.json(products);
});

routes.get("/pdf", async (request: Request, response: Response) => {
  const products = await prismaClient.products.findMany();

  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };
  // pdfmake.addFonts(fonts);

  const printer = new PDFPrinter(fonts);

  const body = [];

  for await (let product of products) {
    const rows = new Array();
    rows.push(product.description);
    rows.push(product.price);
    rows.push(product.quantity);

    body.push(rows);
  }

  const docDefinitions: TDocumentDefinitions = {
    defaultStyle: { font: "Helvetica" },
    content: [
      {
        columns: [
          { text: "Relatorio", style: "header" },
          { text: "hoje\n\n", style: "header" },
        ],
      },
      {
        table: {
          body: [
            [
              { text: "ID", style: "columnsTitle" },
              { text: "Descrição", style: "columnsTitle" },
              { text: "preço", style: "columnsTitle" },
              { text: "Quantidade", style: "columnsTitle" },
            ],
            ...body,
          ],
        },
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
      },
      columnsTitle: {
        fontSize: 15,
        bold: true,
        fillColor: "#7159c1",
        color: "#FFF",
      },
    },
  };
  const pdfDoc = printer.createPdfKitDocument(docDefinitions);

  // Salvar em arquivo
  // pdfDoc.pipe(fs.createWriteStream("Relatorio.pdf"));

  const chunks: any = [];
  pdfDoc.on("data", (chunk) => {
    chunks.push(chunk);
  });

  pdfDoc.end();

  pdfDoc.on("end", () => {
    const result = Buffer.concat(chunks);
    response.send(result);
  });
});

export { routes };
