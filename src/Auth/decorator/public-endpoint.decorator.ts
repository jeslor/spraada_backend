import { SetMetadata } from '@nestjs/common';

export const IS_Public_API_ENDPOINT = 'IS_PUBLIC';
export const isPublicEndpoint = () => SetMetadata(IS_Public_API_ENDPOINT, true);
