// src/hooks/useTodos.ts
import * as React from 'react';
import { Alert } from 'react-native';

import {
  listTasks, 
  createTask as svcCreate,
  updateTaskCompleted as svcToggle,
  deleteTask as svcRemove,
  type TaskDTO,
} from '../src/services/tasks';

type CreateParams = {
  title: string;
  imageUri: string;
  latitude?: number;
  longitude?: number;
  address?: string;
};

type UseTodosResult = {
  tasks: TaskDTO[];
  loading: boolean;
  reload: () => Promise<void>;
  create: (p: CreateParams) => Promise<void>;
  toggle: (t: TaskDTO) => Promise<void>;
  remove: (t: TaskDTO) => Promise<void>;
};

export function useTodos(): UseTodosResult {
  const [tasks, setTasks] = React.useState<TaskDTO[]>([]);
  const [loading, setLoading] = React.useState(false);

  const reload = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await listTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = React.useCallback(async (p: CreateParams) => {
    try {
      setLoading(true);
      await svcCreate(p);
      await reload();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo crear la tarea');
    } finally {
      setLoading(false);
    }
  }, [reload]);

  const toggle = React.useCallback(async (t: TaskDTO) => {
    try {
      setLoading(true);
      const id = String(
        (t as any).id ?? (t as any)._id ?? (t as any).todoId ?? (t as any).uuid ?? (t as any).key
      );
      await svcToggle(id, !t.completed);
      await reload();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo actualizar');
    } finally {
      setLoading(false);
    }
  }, [reload]);

  const remove = React.useCallback(async (t: TaskDTO) => {
    try {
      setLoading(true);
      const id = String(
        (t as any).id ?? (t as any)._id ?? (t as any).todoId ?? (t as any).uuid ?? (t as any).key
      );
      await svcRemove(id);
      await reload();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo eliminar');
    } finally {
      setLoading(false);
    }
  }, [reload]);

  React.useEffect(() => {
    // carga inicial
    reload();
  }, [reload]);

  return { tasks, loading, reload, create, toggle, remove };
}
