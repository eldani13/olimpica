import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import Table from "../components/Table";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import Modal from "react-modal";

Modal.setAppElement("#root");

const Home = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // if (!isAuthenticated) {
  //   navigate("/");
  //   return null;
  // }

  useEffect(() => {}, []);

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const generateExcel = async () => {
    // console.log("Estado inicial de productos:", products);
    const processedData = products.map((product) => {
      const dias = product.days || {};
      return {
        SAP: product.sap,
        NOMBRE: product.name,
        L: dias.lunes || 0,
        M: dias.martes || 0,
        M: dias.miercoles || 0,
        J: dias.jueves || 0,
        V: dias.viernes || 0,
        S: dias.sabado || 0,
      };
    });

    // console.log("Estado procesado para Excel:", processedData);
    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
    const fileName = `productos_${getCurrentDate().replace(/\//g, "-")}.xlsx`;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    XLSX.writeFile(workbook, fileName);

    const resetProducts = products.map((product) => ({
      ...product,
      days: {
        lunes: 0,
        martes: 0,
        miercoles: 0,
        jueves: 0,
        viernes: 0,
        sabado: 0,
      },
    }));

    setProducts(resetProducts);

    try {
      await Promise.all(
        resetProducts.map((product) =>
          fetch(`https://backend-olimpica.onrender.com/api/products/${product.sap}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ days: product.days }),
          })
        )
      );
      setSuccessModalOpen(true);
    } catch (error) {
      console.error(
        "Error al resetear los valores de los días en el servidor",
        error
      );
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center p-6 mb-6 bg-gradient-to-r from-[#005caa] to-[#e30613] shadow-md">
        <h1 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">
          Gestión de productos
        </h1>
        <button
          onClick={logout}
          className="bg-white text-blue-700 font-semibold px-6 py-2 rounded-full shadow-md hover:bg-red-100 transition duration-200 ease-in-out transform hover:scale-105"
        >
          Logout
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <h2 className="text-2xl text-center font-extrabold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">
          Tabla de Productos
        </h2>
        <h1 className="text-lg text-left ml-5 font-medium text-gray-600 mb-4">
          {getCurrentDate()}
        </h1>

        <button
          onClick={() => setConfirmModalOpen(true)}
          className="bg-gradient-to-r ml-5 from-green-500 to-emerald-500 text-white font-semibold px-5 py-2 rounded-lg flex items-center gap-2 shadow-md hover:from-green-600 hover:to-emerald-600 transform transition duration-200 ease-in-out hover:scale-105 mb-4"
        >
          <FaFileExcel className="text-xl" />
          Generar Excel
        </button>

        <Table onProductsChange={setProducts} />
      </div>

      <Modal
        isOpen={confirmModalOpen}
        onRequestClose={() => setConfirmModalOpen(false)}
        contentLabel="Confirmación"
        className="bg-white p-6 rounded shadow-md mx-auto mt-24 w-1/2"
      >
        <h2 className="text-xl font-bold mb-4 text-center">¿Estás seguro?</h2>
        <p className="mb-4 text-center">
          ¿Deseas generar el archivo Excel de productos?
        </p>
        <div className="flex flex-row gap-10 justify-center items-center">
          <button
            onClick={() => {
              generateExcel();
              setConfirmModalOpen(false);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Sí
          </button>
          <button
            onClick={() => setConfirmModalOpen(false)}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            No
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={successModalOpen}
        onRequestClose={() => setSuccessModalOpen(false)}
        contentLabel="Éxito"
        className="bg-white p-6 rounded shadow-md mx-auto mt-24 w-1/2"
      >
        <h2 className="text-xl font-bold mb-4 text-center">
          ¡Archivo Generado!
        </h2>
        <p className="mb-4 text-center">
          El archivo Excel se ha generado exitosamente.
        </p>
        <div className="flex justify-center items-center">
          <button
            onClick={() => setSuccessModalOpen(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Aceptar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Home;
