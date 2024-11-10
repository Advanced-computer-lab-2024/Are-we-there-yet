import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { createPortal } from "react-dom";

export interface ModalRef {
  open(): void;
  close(): void;
}

interface ModalProps {
  children: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
}

const Modal = forwardRef(function Modal(
  { children, open = false, onClose }: ModalProps,
  ref: React.Ref<ModalRef>,
) {
  const dialog = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => {
    return {
      open() {
        dialog.current?.showModal();
      },
      close() {
        dialog.current?.close();
      },
    };
  });

  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [open]);

  return createPortal(
    <dialog
      ref={dialog}
      onClose={onClose}
      className="backdrop:bg-base-black/15 w-2/3 rounded-lg p-12 shadow-md outline-none"
    >
      {children}
    </dialog>,
    document.getElementById("modal-root")!,
  );
});

export default Modal;
