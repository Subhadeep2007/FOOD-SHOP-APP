import api from "./axios";

const unwrap = (response) => response.data && response.data.data ? response.data.data : response.data;
const getAddresses = async () => unwrap(await api.get("/addresses"));
const createAddress = async (data) => unwrap(await api.post("/addresses", data));
const updateAddress = async (id, data) => unwrap(await api.patch("/addresses/" + id, data));
const deleteAddress = async (id) => unwrap(await api.delete("/addresses/" + id));

export { getAddresses, createAddress, updateAddress, deleteAddress };
