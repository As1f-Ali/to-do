
"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2, Plus, Check, X } from "lucide-react"

export default function TodoApp() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [newTodo, setNewTodo] = useState({ title: "", description: "" })
  const [editingId, setEditingId] = useState(null)
  const [editingTodo, setEditingTodo] = useState({ title: "", description: "" })

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/todos")
      if (!response.ok) throw new Error("Failed to fetch todos")
      const data = await response.json()
      setTodos(data)
      setError("")
    } catch (err) {
      setError("Failed to load todos")
      console.error("Error fetching todos:", err)
    } finally {
      setLoading(false)
    }
  }

  // Add new todo
  const addTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.title.trim() || !newTodo.description.trim()) {
      setError("Title and description are required")
      return
    }

    try {
      const response = await fetch("http://localhost:3001/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      })

      if (!response.ok) throw new Error("Failed to create todo")

      const createdTodo = await response.json()
      setTodos([...todos, createdTodo])
      setNewTodo({ title: "", description: "" })
      setError("")
    } catch (err) {
      setError("Failed to add todo")
      console.error("Error adding todo:", err)
    }
  }

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/todos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete todo")

      setTodos(todos.filter((todo) => todo.id !== id))
      setError("")
    } catch (err) {
      setError("Failed to delete todo")
      console.error("Error deleting todo:", err)
    }
  }

  // Start editing
  const startEditing = (todo) => {
    setEditingId(todo.id)
    setEditingTodo({ title: todo.title, description: todo.description })
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null)
    setEditingTodo({ title: "", description: "" })
  }

  // Save edited todo
  const saveEdit = async (id) => {
    if (!editingTodo.title.trim() || !editingTodo.description.trim()) {
      setError("Title and description are required")
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingTodo),
      })

      if (!response.ok) throw new Error("Failed to update todo")

      const updatedTodo = await response.json()
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)))
      setEditingId(null)
      setEditingTodo({ title: "", description: "" })
      setError("")
    } catch (err) {
      setError("Failed to update todo")
      console.error("Error updating todo:", err)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Todo Application</h1>
          <p className="text-gray-600">Manage your tasks efficiently</p>
        </div>

        {/* Error Message */}
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

        {/* Add Todo Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Todo</h2>
          <form onSubmit={addTodo} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter todo title"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter todo description"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Todo
            </button>
          </form>
        </div>

        {/* Todos List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Your Todos</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading todos...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No todos found. Add your first todo above!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {todos.map((todo) => (
                <div key={todo.id} className="p-6">
                  {editingId === todo.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={editingTodo.title}
                          onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Todo title"
                        />
                      </div>
                      <div>
                        <textarea
                          value={editingTodo.description}
                          onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Todo description"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveEdit(todo.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{todo.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{todo.description}</p>
                        <p className="text-xs text-gray-400 mt-2">ID: {todo.id}</p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => startEditing(todo)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
