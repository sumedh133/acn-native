import Toast, {
  BaseToastProps,
  ErrorToast,
  InfoToast,
  SuccessToast,
  ToastConfig,
} from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  position?: 'top' | 'bottom';
  visibilityTime?: number;
  autoHide?: boolean;
  isInModal?: boolean; // New option to indicate if toast is shown in a modal
}

const defaultOptions: ToastOptions = {
  position: 'top',
  visibilityTime: 3000,
  autoHide: true,
  isInModal: false, // Default is not in modal
};


export const showToast = (
  type: ToastType,
  message: string,
  options: ToastOptions = {}
) => {
  const finalOptions = { ...defaultOptions, ...options };
  const topOffset = finalOptions.isInModal ? 20 : 60;

  Toast.show({
    type,
    text1: message,
    position: finalOptions.position,
    visibilityTime: finalOptions.visibilityTime,
    autoHide: finalOptions.autoHide,
    topOffset: topOffset
  });
};

const toastProps: BaseToastProps = {
  text1NumberOfLines: 10,
  text1Style: {
    fontSize: 14,
    fontWeight: 500
  },
  style: {
    height: "auto",
    paddingVertical: 20,
    paddingHorizontal: 0,
  },
};


export const toastConfig: ToastConfig = {
  success: (props) => SuccessToast({
    ...props, ...toastProps, style:
      [
        toastProps.style,
        {
          borderLeftColor: "#69C779",
        },
      ]
  }),
  error: (props) => ErrorToast({
    ...props, ...toastProps, style:
      [
        toastProps.style,
        {
          borderLeftColor: "#FE6301",
        },
      ]
  }),
  info: (props) => InfoToast({
    ...props, ...toastProps, style:
      [
        toastProps.style,
        {
          borderLeftColor: "#87CEFA",
        },
      ]
  }),
};

// Convenience methods
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  showToast('success', message, options);
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  showToast('error', message, options);
};

export const showInfoToast = (message: string, options?: ToastOptions) => {
  showToast('info', message, options);
}; 