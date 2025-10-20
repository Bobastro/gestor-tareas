import React, { useState, useEffect } from 'react';
import { Plus, X, GripVertical, Edit2, Trash2, Calendar, Flag, Tag } from 'lucide-react';

export default function App() {
  // Cargar datos desde localStorage o usar datos iniciales
  const getInitialBoards = () => {
    const savedBoards = localStorage.getItem('taskBoards');
    if (savedBoards) {
      return JSON.parse(savedBoards);
    }
    // Datos iniciales por defecto
    return [
      {
        id: 1,
        title: 'Por Hacer',
        cards: [
          { 
            id: 1, 
            title: 'Diseñar mockups', 
            description: 'Crear diseños iniciales del proyecto',
            priority: 'high',
            dueDate: '2025-10-20',
            tags: ['diseño', 'urgente']
          },
          { 
            id: 2, 
            title: 'Configurar proyecto', 
            description: 'Inicializar repositorio y dependencias',
            priority: 'medium',
            dueDate: '2025-10-15',
            tags: ['desarrollo']
          }
        ]
      },
      {
        id: 2,
        title: 'En Progreso',
        cards: [
          { 
            id: 3, 
            title: 'Desarrollar componentes', 
            description: 'Crear componentes React principales',
            priority: 'high',
            dueDate: '2025-10-18',
            tags: ['desarrollo', 'frontend']
          }
        ]
      },
      {
        id: 3,
        title: 'Completado',
        cards: []
      }
    ];
  };

  const [boards, setBoards] = useState(getInitialBoards);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedOverBoard, setDraggedOverBoard] = useState(null);

  // Guardar en localStorage cada vez que cambian los boards
  useEffect(() => {
    localStorage.setItem('taskBoards', JSON.stringify(boards));
  }, [boards]);

  const priorityColors = {
    low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
  };

  const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta'
  };

  const tagColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
    'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500'
  ];

  const getTagColor = (tag) => {
    const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return tagColors[index % tagColors.length];
  };

  const addBoard = () => {
    if (newBoardTitle.trim()) {
      setBoards([...boards, {
        id: Date.now(),
        title: newBoardTitle,
        cards: []
      }]);
      setNewBoardTitle('');
      setShowNewBoard(false);
    }
  };

  const deleteBoard = (boardId) => {
    setBoards(boards.filter(b => b.id !== boardId));
  };

  const addCard = (boardId) => {
    const cardTitle = prompt('Título de la tarjeta:');
    if (cardTitle) {
      setBoards(boards.map(board => {
        if (board.id === boardId) {
          return {
            ...board,
            cards: [...board.cards, {
              id: Date.now(),
              title: cardTitle,
              description: '',
              priority: 'medium',
              dueDate: '',
              tags: []
            }]
          };
        }
        return board;
      }));
    }
  };

  const deleteCard = (boardId, cardId) => {
    setBoards(boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          cards: board.cards.filter(c => c.id !== cardId)
        };
      }
      return board;
    }));
  };

  const updateCard = (boardId, cardId, updates) => {
    setBoards(boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          cards: board.cards.map(card => 
            card.id === cardId ? { ...card, ...updates } : card
          )
        };
      }
      return board;
    }));
  };

  const handleDragStart = (e, card, boardId) => {
    setDraggedCard({ card, sourceBoardId: boardId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, boardId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverBoard(boardId);
  };

  const handleDrop = (e, targetBoardId) => {
    e.preventDefault();
    if (!draggedCard) return;

    const { card, sourceBoardId } = draggedCard;

    if (sourceBoardId === targetBoardId) {
      setDraggedCard(null);
      setDraggedOverBoard(null);
      return;
    }

    setBoards(boards.map(board => {
      if (board.id === sourceBoardId) {
        return {
          ...board,
          cards: board.cards.filter(c => c.id !== card.id)
        };
      }
      if (board.id === targetBoardId) {
        return {
          ...board,
          cards: [...board.cards, card]
        };
      }
      return board;
    }));

    setDraggedCard(null);
    setDraggedOverBoard(null);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return due < today;
  };

  const clearAllData = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todas las tareas y tableros? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('taskBoards');
      window.location.reload();
    }
  };

  const EditCardModal = ({ card, boardId, onClose }) => {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description);
    const [priority, setPriority] = useState(card.priority);
    const [dueDate, setDueDate] = useState(card.dueDate);
    const [tags, setTags] = useState(card.tags || []);
    const [newTag, setNewTag] = useState('');

    const handleSave = () => {
      updateCard(boardId, card.id, { title, description, priority, dueDate, tags });
      onClose();
    };

    const addTag = () => {
      if (newTag.trim() && !tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
        setNewTag('');
      }
    };

    const removeTag = (tagToRemove) => {
      setTags(tags.filter(t => t !== tagToRemove));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Editar Tarjeta</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Título de la tarjeta"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Añade una descripción..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Flag size={16} className="inline mr-1" />
                  Prioridad
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Fecha límite
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag size={16} className="inline mr-1" />
                Etiquetas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nueva etiqueta..."
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`${getTagColor(tag)} text-white px-3 py-1 rounded-full text-sm flex items-center gap-2`}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:bg-white hover:bg-opacity-20 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Mi Gestor de Tareas</h1>
            <p className="text-blue-100">Organiza tus proyectos con prioridades, fechas y etiquetas</p>
          </div>
          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
            title="Eliminar todos los datos"
          >
            <Trash2 size={18} />
            Limpiar Todo
          </button>
        </header>

        <div className="flex gap-6 overflow-x-auto pb-6">
          {boards.map(board => (
            <div
              key={board.id}
              className="flex-shrink-0 w-80 bg-gray-100 rounded-lg shadow-lg"
              onDragOver={(e) => handleDragOver(e, board.id)}
              onDrop={(e) => handleDrop(e, board.id)}
            >
              <div className="p-4 bg-gray-200 rounded-t-lg flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">{board.title}</h2>
                <button
                  onClick={() => deleteBoard(board.id)}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className={`p-4 space-y-3 min-h-32 transition-colors ${
                draggedOverBoard === board.id ? 'bg-blue-50' : ''
              }`}>
                {board.cards.map(card => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card, board.id)}
                    className={`bg-white rounded-lg shadow p-4 cursor-move hover:shadow-md transition-shadow group border-l-4 ${priorityColors[card.priority].border}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2 flex-1">
                        <GripVertical size={16} className="text-gray-400 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 mb-1">{card.title}</h3>
                          
                          {card.tags && card.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {card.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className={`${getTagColor(tag)} text-white px-2 py-0.5 rounded-full text-xs`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span className={`flex items-center gap-1 px-2 py-1 rounded ${priorityColors[card.priority].bg} ${priorityColors[card.priority].text}`}>
                              <Flag size={12} />
                              {priorityLabels[card.priority]}
                            </span>
                            
                            {card.dueDate && (
                              <span className={`flex items-center gap-1 ${isOverdue(card.dueDate) ? 'text-red-600 font-semibold' : ''}`}>
                                <Calendar size={12} />
                                {new Date(card.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingCard({ card, boardId: board.id })}
                          className="text-gray-400 hover:text-blue-600 p-1"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteCard(board.id, card.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    {card.description && (
                      <p className="text-sm text-gray-600 ml-6 mt-2">{card.description}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => addCard(board.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors border-2 border-dashed border-gray-300 hover:border-gray-400"
                >
                  <Plus size={18} />
                  <span>Añadir tarjeta</span>
                </button>
              </div>
            </div>
          ))}

          {showNewBoard ? (
            <div className="flex-shrink-0 w-80 bg-gray-100 rounded-lg shadow-lg p-4">
              <input
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addBoard()}
                placeholder="Título de la lista..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={addBoard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Añadir lista
                </button>
                <button
                  onClick={() => {
                    setShowNewBoard(false);
                    setNewBoardTitle('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewBoard(true)}
              className="flex-shrink-0 w-80 h-24 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition-all"
            >
              <Plus size={20} />
              <span>Añadir lista</span>
            </button>
          )}
        </div>
      </div>

      {editingCard && (
        <EditCardModal
          card={editingCard.card}
          boardId={editingCard.boardId}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}