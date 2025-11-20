import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Film, X, FileText, Home, List, Sparkles, Heart, Users, Eye } from 'lucide-react';

export default function ScriptManager() {
  const [scripts, setScripts] = useState([]);
  const [sharedScripts, setSharedScripts] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [editingId, setEditingId] = useState(null);
  const [userName, setUserName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPublic: false
  });

  useEffect(() => {
    loadMyScripts();
    loadSharedScripts();
    loadUserName();
  }, []);

  const loadUserName = () => {
    const saved = localStorage.getItem('userName');
    if (saved) {
      setUserName(saved);
    }
  };

  const loadMyScripts = async () => {
    const saved = localStorage.getItem('scripts');
    if (saved) {
      setScripts(JSON.parse(saved));
    }
  };

  const loadSharedScripts = async () => {
    try {
      const shared = localStorage.getItem('sharedScripts');
      if (shared) {
        setSharedScripts(JSON.parse(shared));
      }
    } catch (error) {
      console.log('Carregando roteiros compartilhados...');
      setSharedScripts([]);
    }
  };

  useEffect(() => {
    localStorage.setItem('scripts', JSON.stringify(scripts));
  }, [scripts]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert('Por favor, preencha todos os campos ✨');
      return;
    }

    if (formData.isPublic && !userName) {
      setShowNamePrompt(true);
      return;
    }
    
    if (editingId) {
      const updatedScripts = scripts.map(item => 
        item.id === editingId ? { ...formData, id: editingId, updatedAt: new Date().toISOString(), author: userName } : item
      );
      setScripts(updatedScripts);
      
      if (formData.isPublic) {
        try {
          const sharedScript = { ...formData, id: editingId, updatedAt: new Date().toISOString(), author: userName };
          const existingShared = JSON.parse(localStorage.getItem('sharedScripts') || '[]');
          const filtered = existingShared.filter(s => s.id !== editingId);
          localStorage.setItem('sharedScripts', JSON.stringify([...filtered, sharedScript]));
          await loadSharedScripts();
        } catch (error) {
          console.log('Erro ao compartilhar roteiro');
        }
      }
      setEditingId(null);
    } else {
      const newScript = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        author: formData.isPublic ? userName : undefined
      };
      setScripts([newScript, ...scripts]);
      
      if (formData.isPublic) {
        try {
          const existingShared = JSON.parse(localStorage.getItem('sharedScripts') || '[]');
          localStorage.setItem('sharedScripts', JSON.stringify([...existingShared, newScript]));
          await loadSharedScripts();
        } catch (error) {
          console.log('Erro ao compartilhar roteiro');
        }
      }
    }

    setFormData({
      title: '',
      content: '',
      isPublic: false
    });
    setCurrentView('list');
  };

  const handleEdit = (script) => {
    setFormData({
      title: script.title,
      content: script.content,
      isPublic: script.isPublic || false
    });
    setEditingId(script.id);
    setCurrentView('create');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este roteiro? 🥺')) {
      setScripts(scripts.filter(item => item.id !== id));
      
      try {
        const existingShared = JSON.parse(localStorage.getItem('sharedScripts') || '[]');
        const filtered = existingShared.filter(s => s.id !== id);
        localStorage.setItem('sharedScripts', JSON.stringify(filtered));
        await loadSharedScripts();
      } catch (error) {
        console.log('Roteiro removido');
      }
    }
  };

  const handleCancel = () => {
    setCurrentView('home');
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      isPublic: false
    });
  };

  const saveUserName = (name) => {
    const trimmedName = name.trim();
    if (trimmedName) {
      setUserName(trimmedName);
      localStorage.setItem('userName', trimmedName);
      setShowNamePrompt(false);
      handleSubmit();
    } else {
      alert('Por favor, digite seu nome! 💫');
    }
  };

  const renderHome = () => (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-block bg-gradient-to-br from-pink-400 to-purple-400 p-6 rounded-full mb-6 shadow-lg">
          <Film size={64} className="text-white" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Meus Roteirinhos ✨
        </h1>
        <p className="text-purple-200 text-xl">O que vamos criar hoje?</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => setCurrentView('create')}
          className="bg-gradient-to-br from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 rounded-3xl p-8 transition transform hover:scale-105 shadow-xl group"
        >
          <div className="bg-white/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition">
            <Plus size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Criar Roteiro</h2>
          <p className="text-pink-50">Comece uma nova história! 📝</p>
        </button>

        <button
          onClick={() => setCurrentView('list')}
          className="bg-gradient-to-br from-purple-300 to-purple-400 hover:from-purple-400 hover:to-purple-500 rounded-3xl p-8 transition transform hover:scale-105 shadow-xl group"
        >
          <div className="bg-white/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition">
            <List size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Meus Roteiros</h2>
          <p className="text-purple-50">
            {scripts.length > 0 ? `${scripts.length} roteirinho${scripts.length !== 1 ? 's' : ''} guardadinho${scripts.length !== 1 ? 's' : ''} 💕` : 'Nenhum roteiro ainda 🌟'}
          </p>
        </button>

        <button
          onClick={() => setCurrentView('community')}
          className="bg-gradient-to-br from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 rounded-3xl p-8 transition transform hover:scale-105 shadow-xl group"
        >
          <div className="bg-white/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition">
            <Users size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Comunidade</h2>
          <p className="text-blue-50">
            {sharedScripts.length > 0 ? `${sharedScripts.length} roteiro${sharedScripts.length !== 1 ? 's' : ''} compartilhado${sharedScripts.length !== 1 ? 's' : ''} 🌟` : 'Explore histórias! 🌈'}
          </p>
        </button>
      </div>
    </div>
  );

  const renderCreate = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
            {editingId ? '✏️ Editar Roteiro' : '✨ Novo Roteiro'}
          </h2>
          <button 
            onClick={handleCancel} 
            className="text-gray-400 hover:text-gray-600 hover:rotate-90 transition"
          >
            <X size={28} />
          </button>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-pink-400" />
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
              placeholder="Ex: A Última Fronteira 🚀"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Heart size={16} className="text-purple-400" />
              Roteiro
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows="16"
              className="w-full px-5 py-3 border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 font-mono text-sm transition"
              placeholder="Era uma vez... ✨"
            />
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-2xl border-2 border-blue-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                className="w-5 h-5 rounded border-blue-300 text-blue-500 focus:ring-blue-400"
              />
              <div>
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                  <Users size={18} className="text-blue-500" />
                  Compartilhar com a comunidade
                </span>
                <p className="text-sm text-gray-600 mt-1">Outros usuários poderão ver este roteiro 💫</p>
              </div>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-pink-400 to-purple-400 text-white py-4 rounded-2xl hover:from-pink-500 hover:to-purple-500 transition font-semibold shadow-lg transform hover:scale-105"
            >
              {editingId ? '💾 Salvar Alterações' : '✨ Criar Roteiro'}
            </button>
            <button
              onClick={handleCancel}
              className="px-8 py-4 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 transition font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderList = () => (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          Meus Roteiros 💕
        </h2>
        <button
          onClick={() => setCurrentView('create')}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white px-6 py-3 rounded-full hover:from-pink-500 hover:to-purple-500 transition shadow-lg transform hover:scale-105 font-semibold"
        >
          <Plus size={20} />
          Novo Roteiro
        </button>
      </div>

      <div className="grid gap-5">
        {scripts.length === 0 ? (
          <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl shadow-lg p-16 text-center">
            <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText size={48} className="text-purple-300" />
            </div>
            <p className="text-purple-600 text-xl font-semibold mb-2">Nenhum roteiro ainda 🌟</p>
            <p className="text-purple-400">Que tal criar seu primeiro roteirinho?</p>
          </div>
        ) : (
          scripts.map(script => (
            <div key={script.id} className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition transform hover:scale-[1.02]">
              <div className="p-7">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        {script.title}
                      </h3>
                      {script.isPublic && (
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          <Users size={14} />
                          Público
                        </span>
                      )}
                    </div>
                    {script.author && (
                      <p className="text-gray-500 text-sm">Por: {script.author} ✨</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(script)}
                      className="p-3 text-blue-500 hover:bg-blue-50 rounded-2xl transition transform hover:scale-110"
                    >
                      <Edit2 size={22} />
                    </button>
                    <button
                      onClick={() => handleDelete(script.id)}
                      className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition transform hover:scale-110"
                    >
                      <Trash2 size={22} />
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5 max-h-96 overflow-y-auto border-2 border-purple-100">
                  <p className="text-gray-700 whitespace-pre-line font-mono text-sm leading-relaxed">
                    {script.content}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm text-purple-400 font-medium">
                  <Sparkles size={16} />
                  Criado em {new Date(script.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderCommunity = () => (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Comunidade 🌟
        </h2>
        <p className="text-purple-200 text-lg">Descubra histórias incríveis de outros criadores!</p>
      </div>

      <div className="grid gap-5">
        {sharedScripts.length === 0 ? (
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-lg p-16 text-center">
            <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users size={48} className="text-blue-300" />
            </div>
            <p className="text-blue-600 text-xl font-semibold mb-2">Nenhum roteiro compartilhado ainda 🌈</p>
            <p className="text-blue-400">Seja o primeiro a compartilhar sua história!</p>
          </div>
        ) : (
          sharedScripts.map(script => (
            <div key={script.id} className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition">
              <div className="p-7">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                        {script.title}
                      </h3>
                      <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Eye size={14} />
                        Comunidade
                      </span>
                    </div>
                    {script.author && (
                      <p className="text-gray-600 font-medium mb-1">✍️ Por: {script.author}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 max-h-96 overflow-y-auto border-2 border-blue-100">
                  <p className="text-gray-700 whitespace-pre-line font-mono text-sm leading-relaxed">
                    {script.content}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm text-blue-400 font-medium">
                  <Sparkles size={16} />
                  Compartilhado em {new Date(script.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 p-6">
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-br from-pink-400 to-purple-400 p-4 rounded-full mb-4">
                <Sparkles size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                Qual é o seu nome?
              </h3>
              <p className="text-gray-600">Para que outros saibam quem é o autor deste roteiro incrível! ✨</p>
            </div>
            <input
              type="text"
              placeholder="Digite seu nome aqui..."
              className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  saveUserName(e.target.value);
                }
              }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  const input = e.target.parentElement.previousElementSibling;
                  saveUserName(input.value);
                }}
                className="flex-1 bg-gradient-to-r from-pink-400 to-purple-400 text-white py-3 rounded-2xl hover:from-pink-500 hover:to-purple-500 transition font-semibold"
              >
                Salvar
              </button>
              <button
                onClick={() => {
                  setShowNamePrompt(false);
                  setFormData({...formData, isPublic: false});
                }}
                className="px-6 py-3 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="max-w-6xl mx-auto mb-10 flex gap-3 bg-white/40 backdrop-blur p-2 rounded-full shadow-lg">
        <button
          onClick={() => setCurrentView('home')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition font-semibold ${
            currentView === 'home' 
              ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg' 
              : 'text-purple-600 hover:bg-white/60'
          }`}
        >
          <Home size={20} />
          Início
        </button>
        <button
          onClick={() => setCurrentView('create')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition font-semibold ${
            currentView === 'create' 
              ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg' 
              : 'text-purple-600 hover:bg-white/60'
          }`}
        >
          <Plus size={20} />
          Criar
        </button>
        <button
          onClick={() => setCurrentView('list')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition font-semibold ${
            currentView === 'list' 
              ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg' 
              : 'text-purple-600 hover:bg-white/60'
          }`}
        >
          <List size={20} />
          Meus ({scripts.length})
        </button>
        <button
          onClick={() => setCurrentView('community')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition font-semibold ${
            currentView === 'community' 
              ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg' 
              : 'text-purple-600 hover:bg-white/60'
          }`}
        >
          <Users size={20} />
          Comunidade ({sharedScripts.length})
        </button>
      </nav>

      {currentView === 'home' && renderHome()}
      {currentView === 'create' && renderCreate()}
      {currentView === 'list' && renderList()}
      {currentView === 'community' && renderCommunity()}
    </div>
  );
}