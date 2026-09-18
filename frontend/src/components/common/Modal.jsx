import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = '540px' }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="modal-overlay animate-fade-in"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="modal-dialog"
                style={{ '--dialog-max-width': maxWidth }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Mobile Bottom Sheet Pull Indicator */}
                <div className="modal-sheet-handle-container" aria-hidden="true">
                    <div className="modal-sheet-handle" />
                </div>

                {/* Modal Header */}
                <div className="modal-header">
                    <h3 id="modal-title" style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0,
                    }}>
                        {title}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="btn-icon modal-close-btn"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Scrollable Body */}
                <div className="modal-body">
                    {children}
                </div>

                {/* Optional Sticky Footer */}
                {footer && (
                    <div className="modal-sticky-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};