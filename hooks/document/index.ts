// Base hooks and factory
export { useBaseMutation } from './base-mutation';
export { useBaseQuery } from './base-query';
export { createEntityHooks } from './entity-hooks-factory';

// Entity-specific hooks exports
export * from './skills';
export * from './education';
export * from './experience';
export * from './project';
export * from './language';
export * from './document';
