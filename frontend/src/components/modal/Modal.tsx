import React, { ReactNode } from 'react'

import { IconButton, Typography, Icon } from '@/components'

import Style from './Modal.module.css'

interface ModalProps {
  children: ReactNode;
  title: string;
  hasCloseButton: boolean;
  isOpen: (value: boolean) => void
}

export const Modal: React.FC<ModalProps> = ({
  children,
  title,
  hasCloseButton,
  isOpen,
}) => {
  return (
    <div className={Style['modal-container']}>
      <div className={Style['modal']}>
        <div className={Style['header']}>
          {title && <Typography tag="h1" size="l" className={Style['title']} text={title} />}
          {hasCloseButton && (
            <IconButton
              onClick={() => isOpen(false)}
              icon={<Icon name="exit" height="1.6rem" width="1.6rem" />}
            />
          )}
        </div>
        {children}
      </div>
    </div>
  )
}