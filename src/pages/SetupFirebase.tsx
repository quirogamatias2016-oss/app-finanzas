import { useState } from "react";

export default function SetupFirebase() {
  const [config, setConfig] = useState({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({
      ...config,
      [e.target.name]: e.target.value
    });
  };

  const generateFile = () => {
    const content = `
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "${config.apiKey}",
  authDomain: "${config.authDomain}",
  projectId: "${config.projectId}",
  storageBucket: "${config.storageBucket}",
  messagingSenderId: "${config.messagingSenderId}",
  appId: "${config.appId}"
};

export const app = initializeApp(firebaseConfig);
`;

    const blob = new Blob([content], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "firebase.ts";
    a.click();
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>🔥 Configurar Firebase</h2>

      <input name="apiKey" placeholder="apiKey" onChange={handleChange} />
      <input name="authDomain" placeholder="authDomain" onChange={handleChange} />
      <input name="projectId" placeholder="projectId" onChange={handleChange} />
      <input name="storageBucket" placeholder="storageBucket" onChange={handleChange} />
      <input name="messagingSenderId" placeholder="messagingSenderId" onChange={handleChange} />
      <input name="appId" placeholder="appId" onChange={handleChange} />

      <button onClick={generateFile}>
        Generar firebase.ts
      </button>
    </div>
  );
}
