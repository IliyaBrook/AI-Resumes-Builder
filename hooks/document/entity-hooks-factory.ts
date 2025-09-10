'use client';

import { api } from '@/lib/hono-rpc';
import { useBaseMutation } from './base-mutation';

interface EntityConfig {
  name: string;
  endpoint: string;
  messages: {
    create: { success: string; error: string };
    update: { success: string; error: string };
    delete: { success: string; error: string };
  };
  invalidateQueries: string[][];
}

const entityConfigs: Record<string, EntityConfig> = {
  skill: {
    name: 'skill',
    endpoint: 'skill',
    messages: {
      create: {
        success: 'Skill created successfully',
        error: 'Failed to create skill',
      },
      update: {
        success: 'Skill updated successfully',
        error: 'Failed to update skill',
      },
      delete: {
        success: 'Skill deleted successfully',
        error: 'Failed to delete skill',
      },
    },
    invalidateQueries: [['document', 'documentId']],
  },
  education: {
    name: 'education',
    endpoint: 'education',
    messages: {
      create: {
        success: 'Education created successfully',
        error: 'Failed to create education',
      },
      update: {
        success: 'Education updated successfully',
        error: 'Failed to update education',
      },
      delete: {
        success: 'Education deleted successfully',
        error: 'Failed to delete education',
      },
    },
    invalidateQueries: [['document', 'documentId']],
  },
  experience: {
    name: 'experience',
    endpoint: 'experience',
    messages: {
      create: {
        success: 'Experience created successfully',
        error: 'Failed to create experience',
      },
      update: {
        success: 'Experience updated successfully',
        error: 'Failed to update experience',
      },
      delete: {
        success: 'Experience deleted successfully',
        error: 'Failed to delete experience',
      },
    },
    invalidateQueries: [['document', 'documentId']],
  },
  project: {
    name: 'project',
    endpoint: 'project',
    messages: {
      create: {
        success: 'Project created successfully',
        error: 'Failed to create project',
      },
      update: {
        success: 'Project updated successfully',
        error: 'Failed to update project',
      },
      delete: {
        success: 'Project deleted successfully',
        error: 'Failed to delete project',
      },
    },
    invalidateQueries: [['document', 'documentId']],
  },
};

export const createEntityHooks = (entityType: keyof typeof entityConfigs) => {
  const config = entityConfigs[entityType];

  const useCreateEntity = <TData = any>(transformData?: (data: any) => any) => {
    return useBaseMutation<TData, any>({
      mutationFn: async data => {
        const transformedData = transformData ? transformData(data) : data;
        const response = await api.document[`${config.endpoint}/create`].$post({
          json: transformedData,
        });
        return await response.json();
      },
      successMessage: config.messages.create.success,
      errorMessage: config.messages.create.error,
      invalidateQueries: config.invalidateQueries,
    });
  };

  const useUpdateEntity = <TData = any>() => {
    return useBaseMutation<TData, { id: number; data: any }>({
      mutationFn: async ({ id, data }) => {
        const response = await api.document[config.endpoint][`:${config.name}Id`].$patch({
          param: { [`${config.name}Id`]: id.toString() },
          json: data,
        });
        return await response.json();
      },
      successMessage: config.messages.update.success,
      errorMessage: config.messages.update.error,
      invalidateQueries: config.invalidateQueries,
      showSuccessToast: false,
    });
  };

  const useDeleteEntity = <TData = any>() => {
    return useBaseMutation<TData, { id: number }>({
      mutationFn: async ({ id }) => {
        const response = await api.document[config.endpoint][`:${config.name}Id`].$delete({
          param: { [`${config.name}Id`]: id.toString() },
        });
        return await response.json();
      },
      successMessage: config.messages.delete.success,
      errorMessage: config.messages.delete.error,
      invalidateQueries: config.invalidateQueries,
    });
  };

  return {
    useCreate: useCreateEntity,
    useUpdate: useUpdateEntity,
    useDelete: useDeleteEntity,
  };
};
