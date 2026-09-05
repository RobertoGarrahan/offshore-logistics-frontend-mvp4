"use client";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import axios from "axios";

interface Porto { id: string; name: string; lat: string; lon: string; }
interface Clima { porto: string; temperatura_celsius: number; vento_kmh: number; }
interface Fornecedor { id?: number; nome: string; cnpj: string; cep: string; cidade: string; servico: string; }

const PORTOS: Porto[] = [
  { id: "macae", name: "Porto de Macaé (RJ)", lat: "-22.3708", lon: "-41.7869" },
  { id: "bport", name: "B-Port (São João da Barra/RJ)", lat: "-21.6403", lon: "-41.0506" },
  { id: "navship", name: "Navship (Navegantes/SC)", lat: "-26.8372", lon: "-48.6531" }
];

export default function Home() {
  const [clima, setClima] = useState<Clima | null>(null);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [selectedPort, setSelectedPort] = useState<Porto>(PORTOS[0]);
  
  const [form, setForm] = useState<Fornecedor>({ nome: "", cnpj: "", cep: "", cidade: "", servico: "" });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<Fornecedor>({ nome: "", cnpj: "", cep: "", cidade: "", servico: "" });

  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => { fetchFornecedores(); }, []);
  useEffect(() => { fetchClima(selectedPort); }, [selectedPort]);

  const fetchClima = async (port: Porto) => {
    setClima(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/porto/clima?lat=${port.lat}&lon=${port.lon}`);
      setClima({ ...res.data, porto: port.name });
    } catch (error) { console.error(error); }
  };

  const fetchFornecedores = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/fornecedores`);
      setFornecedores(res.data);
    } catch (error) { console.error(error); }
  };

  const handleCepChange = async (e: ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (isEdit) setEditForm({ ...editForm, cep });
    else setForm({ ...form, cep });
    
    if (cep.length === 8) {
      try {
        const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (!res.data.erro) {
          if (isEdit) setEditForm((prev) => ({ ...prev, cidade: res.data.localidade }));
          else setForm((prev) => ({ ...prev, cidade: res.data.localidade }));
        }
      } catch (error) { console.error(error); }
    }
  };

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/fornecedores`, form);
      setForm({ nome: "", cnpj: "", cep: "", cidade: "", servico: "" });
      fetchFornecedores();
    } catch (error) { console.error(error); }
  };

  const openEditModal = (f: Fornecedor) => {
    setEditForm(f);
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/fornecedores/${editForm.id}`, editForm);
      setIsModalOpen(false);
      fetchFornecedores();
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm("Excluir este fornecedor?")) {
      try {
        await axios.delete(`${API_BASE_URL}/fornecedores/${id}`);
        fetchFornecedores();
      } catch (error) { console.error(error); }
    }
  };

  return (
    <div className="h-screen bg-slate-50 p-4 font-sans text-slate-800 flex flex-col overflow-hidden">
      <header className="mb-4 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Painel Logístico Offshore</h1>
        <p className="text-slate-500 text-sm">Gestão integrada de fornecedores e monitoramento climático</p>
      </header>

      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 lg:col-span-1 flex flex-col">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Condições no Porto</h2>
            <select value={selectedPort.id} onChange={(e) => setSelectedPort(PORTOS.find(p => p.id === e.target.value) || PORTOS[0])} className="mb-4 w-full border border-slate-200 p-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium cursor-pointer">
              {PORTOS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {clima ? (
              <div className="text-center bg-blue-50 py-4 rounded-lg border border-blue-100 flex-1 flex flex-col justify-center">
                <p className="text-xs font-medium text-blue-800 bg-blue-100/60 inline-block px-3 py-1 rounded-full mb-2 mx-auto">{clima.porto}</p>
                <p className="text-4xl font-black text-blue-600 my-1 tracking-tighter">{clima.temperatura_celsius}°C</p>
                <p className="text-slate-600 text-sm mt-1">Vento: {clima.vento_kmh} km/h</p>
              </div>
            ) : (
              <div className="animate-pulse flex flex-col items-center justify-center flex-1 bg-slate-50 rounded-lg"><div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div><div className="h-10 bg-slate-200 rounded w-1/2"></div></div>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
            <h2 className="text-base font-bold text-slate-800 mb-4">Adicionar Novo Fornecedor</h2>
            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Razão Social / Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="border p-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              <input type="text" placeholder="CNPJ (Apenas números)" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} className="border p-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              <input type="text" placeholder="CEP" value={form.cep} onChange={(e) => handleCepChange(e, false)} maxLength={8} className="border p-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              <input type="text" placeholder="Cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} className="border bg-slate-50 p-2 text-sm rounded-lg text-slate-500 outline-none" required readOnly />
              <select value={form.servico} onChange={(e) => setForm({ ...form, servico: e.target.value })} className="border p-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none md:col-span-2 bg-white" required>
                <option value="">Selecione a categoria do serviço...</option>
                <option value="Transporte Marítimo">Transporte Marítimo</option>
                <option value="Alimentação e Catering">Alimentação e Catering</option>
                <option value="Manutenção de Equipamentos">Manutenção de Equipamentos</option>
                <option value="Equipamentos de Segurança (EPI)">Equipamentos de Segurança (EPI)</option>
              </select>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold p-2.5 rounded-lg md:col-span-2 transition-colors">Cadastrar Fornecedor</button>
            </form>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex-1 flex flex-col min-h-0">
          <h2 className="text-base font-bold text-slate-800 mb-3">Fornecedores Homologados</h2>
          <div className="overflow-y-auto flex-1 pr-2">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-3 font-semibold rounded-tl-lg">Empresa</th>
                  <th className="p-3 font-semibold">CNPJ</th>
                  <th className="p-3 font-semibold">Localidade</th>
                  <th className="p-3 font-semibold">Categoria</th>
                  <th className="p-3 font-semibold text-center rounded-tr-lg">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fornecedores.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800">{f.nome}</td>
                    <td className="p-3 text-slate-600">{f.cnpj}</td>
                    <td className="p-3 text-slate-600">{f.cidade}</td>
                    <td className="p-3"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-100">{f.servico}</span></td>
                    <td className="p-3 text-center space-x-3">
                      <button onClick={() => openEditModal(f)} className="text-slate-400 hover:text-blue-600 font-medium">Editar</button>
                      <button onClick={() => handleDelete(f.id)} className="text-slate-400 hover:text-red-600 font-medium">Excluir</button>
                    </td>
                  </tr>
                ))}
                {fornecedores.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400 bg-slate-50/50 rounded-b-lg">Nenhum fornecedor cadastrado.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-3 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-base font-bold">Atualizar Dados</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✖</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-3 text-sm">
              <input type="text" value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} className="w-full border p-2 rounded-lg" required />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={editForm.cnpj} onChange={(e) => setEditForm({ ...editForm, cnpj: e.target.value })} className="w-full border p-2 rounded-lg" required />
                <input type="text" value={editForm.cep} onChange={(e) => handleCepChange(e, true)} maxLength={8} className="w-full border p-2 rounded-lg" required />
              </div>
              <input type="text" value={editForm.cidade} onChange={(e) => setEditForm({ ...editForm, cidade: e.target.value })} className="w-full border bg-slate-50 p-2 rounded-lg" required readOnly />
              <select value={editForm.servico} onChange={(e) => setEditForm({ ...editForm, servico: e.target.value })} className="w-full border p-2 rounded-lg bg-white" required>
                <option value="Transporte Marítimo">Transporte Marítimo</option>
                <option value="Alimentação e Catering">Alimentação e Catering</option>
                <option value="Manutenção de Equipamentos">Manutenção de Equipamentos</option>
                <option value="Equipamentos de Segurança (EPI)">Equipamentos de Segurança (EPI)</option>
              </select>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border p-2 rounded-lg">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded-lg">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}