'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { useTranslation } from '@/components/translation-provider'

export function Toaster() {
  const { toasts } = useToast()
  const { t } = useTranslation()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const displayTitle = typeof title === 'string' ? (t(title) !== title ? t(title) : title) : title;
        const displayDesc = typeof description === 'string' ? (t(description) !== description ? t(description) : description) : description;

        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {displayTitle && <ToastTitle>{displayTitle}</ToastTitle>}
              {displayDesc && (
                <ToastDescription>{displayDesc}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
