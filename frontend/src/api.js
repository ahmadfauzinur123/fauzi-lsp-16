const BASE_URL = "http://localhost:5000/api";

async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Terjadi kesalahan");
  return data;
}

export const getSiswa = () => request("/siswa");
export const createSiswa = (body) =>
  request("/siswa", { method: "POST", body: JSON.stringify(body) });
export const updateSiswa = (id, body) =>
  request(`/siswa/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteSiswa = (id) =>
  request(`/siswa/${id}`, { method: "DELETE" });
