// src/utils/message.js
let messageInstance = null

export const initMessage = (instance) => {
  messageInstance = instance
}

export const message = {
  success(msg) {
    if (messageInstance) {
      messageInstance.show(msg, 'success')
    } else {
      console.log('Success:', msg)
      alert(msg)
    }
  },
  error(msg) {
    if (messageInstance) {
      messageInstance.show(msg, 'error')
    } else {
      console.error('Error:', msg)
      alert(msg)
    }
  },
  warning(msg) {
    if (messageInstance) {
      messageInstance.show(msg, 'warning')
    } else {
      console.warn('Warning:', msg)
      alert(msg)
    }
  },
  info(msg) {
    if (messageInstance) {
      messageInstance.show(msg, 'info')
    } else {
      console.info('Info:', msg)
      alert(msg)
    }
  }
}

export const showMessage = (msg, type = 'info') => {
  message[type]?.(msg) || message.info(msg)
}

export default message