"use client";

import React from 'react';
import {
  PlusIcon,
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useContractStore } from '@/src/store/contractStore';
import { ContractSection } from '@/src/types/contract';

interface SectionItemProps {
  section: ContractSection;
  isActive: boolean;
  level: number;
  isCollapsed: boolean;
  onToggleCollapse: (id: string) => void;
}

function SectionItem({ section, isActive, level, isCollapsed, onToggleCollapse }: SectionItemProps) {
  const {
    setActiveSection,
    addSection,
    deleteSection,
    updateSection,
  } = useContractStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddSubSection = () => {
    addSection(section.id, section.level + 1);
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) {
      deleteSection(section.id);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    updateSection(section.id, { title: newTitle });
  };

  const hasChildren = section.children && section.children.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group ${isDragging ? 'z-10' : ''}`}
    >
      <div
        className={`flex items-center px-2 py-1.5 text-xs cursor-pointer hover:bg-gray-100 border-l-2 ${
          isActive 
            ? 'bg-blue-50 border-blue-500 text-blue-700' 
            : 'border-transparent'
        }`}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={() => setActiveSection(section.id)}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
        >
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
        </div>

        {/* Expand/Collapse button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(section.id);
            }}
            className="flex items-center justify-center w-3 h-3 mr-1 hover:bg-gray-200 rounded"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-2.5 h-2.5" />
            ) : (
              <ChevronDownIcon className="w-2.5 h-2.5" />
            )}
          </button>
        )}

        {/* Section icon */}
        <DocumentTextIcon className="w-3 h-3 mr-1 text-gray-400" />

        {/* Section title */}
        <input
          type="text"
          value={section.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-300 focus:rounded px-1 text-xs truncate min-w-0"
          onClick={(e) => e.stopPropagation()}
          title={section.title}
        />

        {/* Actions */}
        <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 ml-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddSubSection();
            }}
            className="p-0.5 hover:bg-gray-200 rounded"
            title="Ajouter une sous-section"
          >
            <PlusIcon className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="p-0.5 hover:bg-red-100 text-red-600 rounded"
            title="Supprimer"
          >
            <TrashIcon className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && !isCollapsed && (
        <div>
          <SortableContext items={section.children.map(child => child.id)} strategy={verticalListSortingStrategy}>
            {section.children.map(child => (
              <SectionTreeItem
                key={child.id}
                section={child}
                level={level + 1}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}

interface SectionTreeItemProps {
  section: ContractSection;
  level: number;
}

function SectionTreeItem({ section, level }: SectionTreeItemProps) {
  const { activeSectionId } = useContractStore();
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(new Set());

  const isActive = activeSectionId === section.id;
  const isCollapsed = collapsedSections.has(section.id);

  const handleToggleCollapse = (id: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <SectionItem
      section={section}
      isActive={isActive}
      level={level}
      isCollapsed={isCollapsed}
      onToggleCollapse={handleToggleCollapse}
    />
  );
}

export default function Sidebar() {
  const { docTree, addSection, moveSection } = useContractStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // TODO: Implement proper drag and drop logic
      console.log('Drag ended:', { active: active.id, over: over?.id });
      moveSection(active.id as string, over?.id as string);
    }
  };

  const handleAddSection = () => {
    addSection();
  };

  return (
    <div className="w-[280px] bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Structure</h2>
          <button
            onClick={handleAddSection}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
          >
            <PlusIcon className="w-3 h-3" />
            <span>Section</span>
          </button>
        </div>
      </div>

      {/* Section tree */}
      <div className="flex-1 overflow-y-auto">
        {docTree.length === 0 ? (
          <div className="p-3 text-center text-gray-500">
            <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">Aucune section</p>
            <button
              onClick={handleAddSection}
              className="mt-2 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
            >
              Ajouter la première section
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={docTree.map(section => section.id)} strategy={verticalListSortingStrategy}>
              {docTree.map(section => (
                <SectionTreeItem
                  key={section.id}
                  section={section}
                  level={0}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
} 