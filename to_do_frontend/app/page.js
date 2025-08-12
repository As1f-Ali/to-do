"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2, Plus, Check, X } from "lucide-react"

export default function TodoApp() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [newTodo, setNewTodo] = useState({ title: "", description: "", status: "pending" })
  const [editingId, setEditingId] = useState(null)
  const [editingTodo, setEditingTodo] = useState({ title: "", description: "", status: "pending" })

  // Fetch todos
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
      setNewTodo({ title: "", description: "", status: "pending" }) // reset form
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
    setEditingTodo({ title: todo.title, description: todo.description, status: todo.status })
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null)
    setEditingTodo({ title: "", description: "", status: "pending" })
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
      setEditingTodo({ title: "", description: "", status: "pending" })
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
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter todo description"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={newTodo.status}
                onChange={(e) => setNewTodo({ ...newTodo, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
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
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editingTodo.title}
                        onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Todo title"
                      />
                      <textarea
                        value={editingTodo.description}
                        onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Todo description"
                      />
                      <select
                        value={editingTodo.status}
                        onChange={(e) => setEditingTodo({ ...editingTodo, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveEdit(todo.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{todo.title}</h3>
                        <p className="text-gray-600">{todo.description}</p>
                        <p className={`text-sm mt-2 font-medium ${todo.status === "completed" ? "text-green-600" : "text-yellow-600"}`}>
                          Status: {todo.status}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => startEditing(todo)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
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
