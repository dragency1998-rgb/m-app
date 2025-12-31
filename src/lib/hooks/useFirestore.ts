// src/lib/hooks/useFirestore.ts
'use client'

import { useState, useCallback } from 'react'
import {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
} from '../db'

interface UseFirestoreOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export const useFirestore = (collectionName: string, options?: UseFirestoreOptions) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const create = useCallback(async (docData: any) => {
    setLoading(true)
    setError(null)
    try {
      const docId = await createDocument(collectionName, docData)
      setData((prev) => [...prev, { id: docId, ...docData }])
      options?.onSuccess?.({ id: docId, ...docData })
      return docId
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      options?.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [collectionName, options])

  const read = useCallback(async (constraints?: any[]) => {
    setLoading(true)
    setError(null)
    try {
      const docs = await getDocuments(collectionName, constraints)
      setData(docs)
      options?.onSuccess?.(docs)
      return docs
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      options?.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [collectionName, options])

  const readOne = useCallback(async (docId: string) => {
    setLoading(true)
    setError(null)
    try {
      const doc = await getDocument(collectionName, docId)
      options?.onSuccess?.(doc)
      return doc
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      options?.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [collectionName, options])

  const update = useCallback(async (docId: string, docData: any) => {
    setLoading(true)
    setError(null)
    try {
      await updateDocument(collectionName, docId, docData)
      setData((prev) =>
        prev.map((doc) => (doc.id === docId ? { ...doc, ...docData } : doc))
      )
      options?.onSuccess?.({ id: docId, ...docData })
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      options?.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [collectionName, options])

  const remove = useCallback(async (docId: string) => {
    setLoading(true)
    setError(null)
    try {
      await deleteDocument(collectionName, docId)
      setData((prev) => prev.filter((doc) => doc.id !== docId))
      options?.onSuccess?.({ id: docId })
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      options?.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [collectionName, options])

  return {
    data,
    loading,
    error,
    create,
    read,
    readOne,
    update,
    remove,
  }
}
