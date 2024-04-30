import { useState } from "react";
import "./App.css";
import { Toaster, toast } from "sonner";
import { uploadFile } from "./services/upload";
import { type Data } from "./types";
import { Search } from "./steps/Search";

const APP_STATUS = {
  IDLE: "idle", //Iniciar
  ERROR: "error", //Error
  READY_UPLOAD: "ready_upload", // Antes de subir
  UPLOADING: "uploading", // Subiendo
  READY_USAGE: "ready_usage", //Busqueda
} as const;

const BUTTON_TEXT = {
  [APP_STATUS.READY_UPLOAD]: "Subir archivo",
  [APP_STATUS.UPLOADING]: "Subiendo...",
};

type AppStatusType = (typeof APP_STATUS)[keyof typeof APP_STATUS];

function App() {
  const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.IDLE);
  const [data, setData] = useState<Data>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    console.log(file);
    if (file) {
      setFile(file);
      setAppStatus(APP_STATUS.READY_UPLOAD);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (appStatus !== APP_STATUS.READY_UPLOAD || !file) {
      return;
    }

    setAppStatus(APP_STATUS.UPLOADING);

    const [err, newData] = await uploadFile(file);

    console.log(newData);

    if (err) {
      setAppStatus(APP_STATUS.ERROR);
      toast.error(err.message);
      return;
    }

    setAppStatus(APP_STATUS.READY_USAGE);
    if (newData) setData(newData);
    toast.success("Archivo subido correctamente");
  };

  const showButton =
    appStatus === APP_STATUS.READY_UPLOAD || appStatus === APP_STATUS.UPLOADING;

  const showInput = appStatus !== APP_STATUS.READY_USAGE;

  return (
    <>
      <Toaster />
      <h5>Challenge following midudev</h5>
      {showInput && (
        <form onSubmit={handleSubmit}>
          <label htmlFor="">
            <input
              disabled={appStatus === APP_STATUS.UPLOADING}
              onChange={handleInputChange}
              name="file"
              type="file"
              accept=".csv"
            />
          </label>
          {showButton && (
            <button disabled={appStatus === APP_STATUS.UPLOADING}>
              {BUTTON_TEXT[appStatus]}
            </button>
          )}
        </form>
      )}
      {
        appStatus === APP_STATUS.READY_USAGE && (
          <Search initialData={data}/>
        )
      }
    </>
  );
}

export default App;
