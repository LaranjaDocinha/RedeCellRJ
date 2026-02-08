import axios from 'axios';

export const fetchAddressByCep = async (cep: string) => {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;

  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (response.data.erro) return null;

    return {
      street: response.data.logradouro,
      neighborhood: response.data.bairro,
      city: response.data.localidade,
      state: response.data.uf,
    };
  } catch (error) {
    console.error('Error fetching address:', error);
    return null;
  }
};
