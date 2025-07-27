import { toast } from 'react-toastify';

export const notifyToaster = (msg) => {
    toast.error(msg, {
      icon: false
  });
}

export const notifyError = (msg = "Something went wrong, Please try again later.") => {
    toast.error(msg, {
      icon: false
  });
}