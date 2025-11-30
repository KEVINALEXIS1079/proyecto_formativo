import React from 'react';
import { Modal as HeroModal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  footer?: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children, size = 'lg', footer }: ModalProps) => {
  return (
    <HeroModal 
      isOpen={isOpen} 
      onOpenChange={(open) => !open && onClose()}
      size={size}
      backdrop="blur"
      classNames={{
        base: "shadow-2xl ring-1 ring-black/5 bg-white dark:bg-content1",
        header: "border-b border-divider",
        footer: "border-t border-divider",
        closeButton: "hover:bg-default-100 active:bg-default-200",
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        }
      }}
      scrollBehavior="inside"
    >
      <ModalContent>
        {(_onClose) => (
          <>
            {title && <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>}
            <ModalBody className="py-4">
              {children}
            </ModalBody>
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </>
        )}
      </ModalContent>
    </HeroModal>
  );
};
