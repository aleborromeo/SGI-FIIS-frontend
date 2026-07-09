import { fetchApi } from './api';

export interface ResolutionResponse {
  success: boolean;
  timestamp: string;
  message: string;
  data: any;
}

export const resolutionService = {
  issueResolution: (data: {
    numeroResolucion: string;
    fechaEmision: string;
    asunto: string;
    idTramite: number | string;
    file: File;
  }) => {
    const formData = new FormData();
    formData.append('numeroResolucion', data.numeroResolucion);
    formData.append('fechaEmision', data.fechaEmision);
    formData.append('asunto', data.asunto);
    formData.append('idTramite', String(data.idTramite));
    formData.append('fileBytes', data.file); // The PDF uses 'fileBytes' in the DTO

    return fetchApi<ResolutionResponse>('/resolutions', {
      method: 'POST',
      body: formData,
    });
  },
};
