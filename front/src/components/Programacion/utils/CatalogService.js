import axios from 'axios';

export const updateCatBlock = async (apiUrl, token, data) => {
  try {
    const response = await axios.patch(`${apiUrl}/programacion/updateBlockCat/${data.id}/`, {
      nombre: data.nombre,
      color: data.color
    }, {
      headers: { 'Authorization': `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.log("Error al editar la Categoria: ", error.response?.data || error.message);
    throw error;
  }
};