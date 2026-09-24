import { openDB } from 'idb'

const DB_NAME = 'school-offline-db'
const DB_VERSION = 1

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Pending attendance records
      if (!db.objectStoreNames.contains('pending_attendance')) {
        const attendanceStore = db.createObjectStore('pending_attendance', {
          keyPath: 'localId',
          autoIncrement: true,
        })
        attendanceStore.createIndex('date', 'date')
        attendanceStore.createIndex('class_id', 'class_id')
      }

      // Pending grades
      if (!db.objectStoreNames.contains('pending_grades')) {
        db.createObjectStore('pending_grades', {
          keyPath: 'localId',
          autoIncrement: true,
        })
      }

      // Cached students per teacher
      if (!db.objectStoreNames.contains('cached_students')) {
        const studentStore = db.createObjectStore('cached_students', {
          keyPath: 'id',
        })
        studentStore.createIndex('class_id', 'class_id')
      }

      // Cached classes for teacher
      if (!db.objectStoreNames.contains('cached_classes')) {
        db.createObjectStore('cached_classes', { keyPath: 'id' })
      }

      // Cached subjects
      if (!db.objectStoreNames.contains('cached_subjects')) {
        db.createObjectStore('cached_subjects', { keyPath: 'id' })
      }

      // Sync log
      if (!db.objectStoreNames.contains('sync_log')) {
        db.createObjectStore('sync_log', {
          keyPath: 'id',
          autoIncrement: true,
        })
      }
    },
  })
}

// ---- ATTENDANCE ----
export const savePendingAttendance = async (records) => {
  const db = await initDB()
  const tx = db.transaction('pending_attendance', 'readwrite')
  for (const record of records) {
    await tx.store.add({ ...record, savedAt: new Date().toISOString() })
  }
  await tx.done
}

export const getPendingAttendance = async () => {
  const db = await initDB()
  return db.getAll('pending_attendance')
}

export const clearPendingAttendance = async (localIds) => {
  const db = await initDB()
  const tx = db.transaction('pending_attendance', 'readwrite')
  for (const id of localIds) {
    await tx.store.delete(id)
  }
  await tx.done
}

// ---- GRADES ----
export const savePendingGrades = async (records) => {
  const db = await initDB()
  const tx = db.transaction('pending_grades', 'readwrite')
  for (const record of records) {
    await tx.store.add({ ...record, savedAt: new Date().toISOString() })
  }
  await tx.done
}

export const getPendingGrades = async () => {
  const db = await initDB()
  return db.getAll('pending_grades')
}

export const clearPendingGrades = async (localIds) => {
  const db = await initDB()
  const tx = db.transaction('pending_grades', 'readwrite')
  for (const id of localIds) {
    await tx.store.delete(id)
  }
  await tx.done
}

// ---- CACHE STUDENTS ----
export const cacheStudents = async (students) => {
  const db = await initDB()
  const tx = db.transaction('cached_students', 'readwrite')
  await tx.store.clear()
  for (const student of students) {
    await tx.store.put(student)
  }
  await tx.done
}

export const getCachedStudents = async (classId) => {
  const db = await initDB()
  if (classId) {
    const index = db.transaction('cached_students').store.index('class_id')
    return index.getAll(classId)
  }
  return db.getAll('cached_students')
}

// ---- CACHE CLASSES ----
export const cacheClasses = async (classes) => {
  const db = await initDB()
  const tx = db.transaction('cached_classes', 'readwrite')
  await tx.store.clear()
  for (const cls of classes) {
    await tx.store.put(cls)
  }
  await tx.done
}

export const getCachedClasses = async () => {
  const db = await initDB()
  return db.getAll('cached_classes')
}

// ---- CACHE SUBJECTS ----
export const cacheSubjects = async (subjects) => {
  const db = await initDB()
  const tx = db.transaction('cached_subjects', 'readwrite')
  await tx.store.clear()
  for (const subject of subjects) {
    await tx.store.put(subject)
  }
  await tx.done
}

export const getCachedSubjects = async () => {
  const db = await initDB()
  return db.getAll('cached_subjects')
}