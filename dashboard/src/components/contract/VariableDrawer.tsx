"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  XMarkIcon,
  CalendarIcon,
  HashtagIcon,
  DocumentTextIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useContractStore } from '@/src/store/contractStore';
import { ContractVariable } from '@/src/types/contract';

// Schema de validation dynamique
const createVariableSchema = (variables: ContractVariable[]) => {
  const schemaFields: Record<string, any> = {};
  
  variables.forEach(variable => {
    let fieldSchema: any;
    
    switch (variable.type) {
      case 'number':
        fieldSchema = z.number().min(0);
        break;
      case 'date':
        fieldSchema = z.string().min(1, 'Date requise');
        break;
      case 'select':
        fieldSchema = z.string().min(1, 'Sélection requise');
        break;
      default:
        fieldSchema = z.string();
    }
    
    if (variable.required && variable.type !== 'number') {
      fieldSchema = fieldSchema.min(1, `${variable.label} est requis`);
    } else if (!variable.required) {
      fieldSchema = fieldSchema.optional();
    }
    
    schemaFields[variable.key] = fieldSchema;
  });
  
  return z.object(schemaFields);
};

// Fonction pour extraire les variables des sections
const extractVariablesFromSections = (sections: any[]): ContractVariable[] => {
  const variableMap = new Map<string, ContractVariable>();
  
  const processSection = (section: any) => {
    // Extract variables from section content
    const content = JSON.stringify(section.content || {});
    const variableMatches = content.match(/\{\{(\w+)\}\}/g) || [];
    
    variableMatches.forEach(match => {
      const key = match.slice(2, -2);
      if (!variableMap.has(key)) {
        // Default variable definition
        const type = inferVariableType(key);
        const variable: ContractVariable = {
          key,
          label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          type,
          required: true,
        };
        
        // Add options for select variables
        if (type === 'select') {
          variable.options = getDefaultOptions(key);
        }
        
        variableMap.set(key, variable);
      }
    });
    
    // Process defined variables
    if (section.variables && Array.isArray(section.variables)) {
      section.variables.forEach((variable: ContractVariable) => {
        // Ensure select variables have options
        if (variable.type === 'select' && !variable.options) {
          variable.options = getDefaultOptions(variable.key);
        }
        variableMap.set(variable.key, variable);
      });
    }
    
    // Process children
    if (section.children && Array.isArray(section.children)) {
      section.children.forEach(processSection);
    }
  };
  
  sections.forEach(processSection);
  return Array.from(variableMap.values());
};

// Inférer le type de variable à partir de son nom
const inferVariableType = (key: string): ContractVariable['type'] => {
  if (key.includes('date') || key.includes('_date')) return 'date';
  if (key.includes('amount') || key.includes('price') || key.includes('capital')) return 'number';
  if (key.includes('description') || key.includes('content') || key.includes('block')) return 'textarea';
  if (key.includes('legal_form') || key.includes('jurisdiction') || key.includes('rate_unit')) return 'select';
  return 'text';
};

// Get default options for select variables
const getDefaultOptions = (key: string): string[] => {
  switch (key) {
    case 'provider_legal_form':
    case 'client_legal_form':
      return ['SAS', 'SARL', 'SA', 'EURL'];
    case 'jurisdiction':
      return ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille'];
    case 'rate_unit':
      return ['demi-journée', 'journée', 'heure'];
    default:
      return [];
  }
};

// Composant pour chaque champ
interface VariableFieldProps {
  variable: ContractVariable;
  control: any;
  errors: any;
}

function VariableField({ variable, control, errors }: VariableFieldProps) {
  const getIcon = () => {
    switch (variable.type) {
      case 'date':
        return <CalendarIcon className="h-5 w-5 text-gray-400" />;
      case 'number':
        return <HashtagIcon className="h-5 w-5 text-gray-400" />;
      case 'textarea':
        return <DocumentTextIcon className="h-5 w-5 text-gray-400" />;
      case 'select':
        return <ListBulletIcon className="h-5 w-5 text-gray-400" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
        {getIcon()}
        <span>{variable.label}</span>
        {variable.required && <span className="text-red-500">*</span>}
      </label>
      
      <Controller
        name={variable.key}
        control={control}
        render={({ field }) => {
          switch (variable.type) {
            case 'textarea':
              return (
                <textarea
                  {...field}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={variable.default || `Saisir ${variable.label.toLowerCase()}`}
                />
              );
            
            case 'number':
              return (
                <input
                  {...field}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={variable.default || '0'}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              );
            
            case 'date':
              return (
                <input
                  {...field}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              );
            
            case 'select':
              return (
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {variable.options?.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              );
            
            default:
              return (
                <input
                  {...field}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={variable.default || `Saisir ${variable.label.toLowerCase()}`}
                />
              );
          }
        }}
      />
      
      {errors[variable.key] && (
        <p className="text-sm text-red-600">{errors[variable.key].message}</p>
      )}
    </div>
  );
}

export default function VariableDrawer() {
  const {
    docTree,
    variables,
    isVariableDrawerOpen,
    updateVariable,
    setVariables,
    toggleVariableDrawer,
  } = useContractStore();

  // State pour la recherche
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all variables from document
  const allVariables = extractVariablesFromSections(docTree);

  // Filtrer les variables selon le terme de recherche
  const filteredVariables = useMemo(() => {
    if (!searchTerm.trim()) return allVariables;
    
    return allVariables.filter(variable => 
      variable.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allVariables, searchTerm]);
  
  // Create validation schema
  const schema = createVariableSchema(allVariables);
  
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: variables,
  });

  // Watch all form values and update store
  const watchedValues = watch();
  
  useEffect(() => {
    if (isDirty) {
      // Update variables in store
      Object.keys(watchedValues).forEach(key => {
        if (watchedValues[key] !== variables[key]) {
          updateVariable(key, watchedValues[key]);
        }
      });
    }
  }, [watchedValues, isDirty, variables, updateVariable]);

  // Reset form when variables change externally
  useEffect(() => {
    reset(variables);
  }, [variables, reset]);

  const onSubmit = (data: any) => {
    setVariables(data);
    toggleVariableDrawer();
  };

  if (!isVariableDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={toggleVariableDrawer}></div>
        
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 bg-gray-50 sm:px-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900" id="slide-over-title">
                    Variables du contrat
                  </h2>
                  <div className="ml-3 h-7 flex items-center">
                    <button
                      type="button"
                      onClick={toggleVariableDrawer}
                      className="bg-gray-50 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span className="sr-only">Fermer le panneau</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-sm text-gray-500">
                    Modifiez les valeurs des variables utilisées dans votre contrat.
                  </p>
                </div>
                
                {/* Barre de recherche */}
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Rechercher une variable..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="space-y-6">
                    {allVariables.length === 0 ? (
                      <div className="text-center py-12">
                        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune variable</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Ajoutez des variables dans vos sections en utilisant la syntaxe <code>{'{{nom_variable}}'}</code>
                        </p>
                      </div>
                    ) : filteredVariables.length === 0 ? (
                      <div className="text-center py-12">
                        <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune variable trouvée</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Aucune variable ne correspond à votre recherche "{searchTerm}"
                        </p>
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                        >
                          Effacer la recherche
                        </button>
                      </div>
                    ) : (
                      <>
                        {searchTerm && (
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                            <p className="text-sm text-blue-800">
                              {filteredVariables.length} variable{filteredVariables.length > 1 ? 's' : ''} trouvée{filteredVariables.length > 1 ? 's' : ''} pour "{searchTerm}"
                            </p>
                          </div>
                        )}
                        {filteredVariables.map(variable => (
                          <VariableField
                            key={variable.key}
                            variable={variable}
                            control={control}
                            errors={errors}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-gray-50 sm:px-6">
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-500">
                      {searchTerm ? (
                        <>
                          {filteredVariables.length} sur {allVariables.length} variable{allVariables.length > 1 ? 's' : ''}
                        </>
                      ) : (
                        <>
                          {allVariables.length} variable{allVariables.length > 1 ? 's' : ''}
                        </>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={toggleVariableDrawer}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Appliquer
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 