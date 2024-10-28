import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-blue-700 text-black p-6">
      <motion.div 
        className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h1 
          className="text-7xl font-extrabold text-red-500 mb-4"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          404
        </motion.h1>
        <motion.p 
          className="text-xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Lo sentimos, la página que estás buscando no existe.
        </motion.p>
        <motion.div 
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/"  
            className="inline-block mt-4 px-8 py-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-200"
          >
            Volver al Inicio
          </Link>
        </motion.div>
        <motion.p 
          className="text-lg mt-6 opacity-75"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Puedes comprobar la URL o regresar al inicio.
        </motion.p>
      </motion.div>
      <div className="hidden md:block absolute right-0 w-1/2 h-full opacity-20" style={{ background: 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.5))' }}></div>
    </div>
  );
};

export default NotFound;
