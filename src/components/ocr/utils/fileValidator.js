export class FileValidator {
  static MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  static SUPPORTED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/tiff',
    'image/tif'
  ];

  static validateFile(file) {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds 25MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB`
      };
    }

    if (!this.SUPPORTED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Unsupported file format. Supported formats: PDF, JPG, PNG, TIFF'
      };
    }

    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File appears to be empty'
      };
    }

    return { isValid: true };
  }

  static validateFiles(files) {
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      const validation = this.validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    return { validFiles, errors };
  }

  static getAcceptedFormats() {
    return '.pdf,.jpg,.jpeg,.png,.tiff,.tif';
  }

  static getSupportedTypesDisplay() {
    return 'PDF, JPG, PNG, TIFF';
  }
}
