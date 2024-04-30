import express from "express";
import cors from "cors";
import multer from "multer";
import csvToJson from "convert-csv-to-json";

const app = express();
const port = process.env.PORT ?? 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

let userData: Array<Record<string, string>> = [];

app.use(cors()); //enable CORS

app.post("/api/files", upload.single("file"), async (req, res) => {
  // 1. Extract file from requests

  const { file } = req;

  // 2. validate file and mime type - csv
  if (!file) {
    return res.status(400).json({ message: `Error, se requiere el archivo` });
  }

  if (file.mimetype !== "text/csv") {
    return res
      .status(400)
      .json({ message: "Error, el archivo debe ser de tipo csv" });
  }

  let json: Array<Record<string, string>> = [];
  try {
    // 3. transform the data buffer to string
    const rawCsv = Buffer.from(file.buffer).toString("utf-8");
    console.log(rawCsv);
    // 4. transform the string (csv) to json
    json = csvToJson.fieldDelimiter(',').csvStringToJson(rawCsv);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error, hubo un error procesando el archivo" });
  }

  // 5. save the json to bd or memory
  userData = json;

  // 6. return the json with the message
  return res
    .status(200)
    .json({ data: userData, message: "Archivo cargado correctamente" });
});

app.get("/api/users", async (req, res) => {
  // 1. extract the query params q from the req

  const { q } = req.query;

  // 2. validate the query params

  if (!q) {
    return res
      .status(400)
      .json({ message: "No se ha pasado parametro de filtrado" });
  }

  // 3. filter the data with the query params in bd or memory

  const search = q.toString().toLowerCase();
  const filterData = userData.filter((row) => {
    return Object.values(row).some((value) => value.toLowerCase().includes(search));
  });
  // 4. return 200 and message
  return res.status(200).json({ data:filterData });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
