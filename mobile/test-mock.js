import { api } from './src/services/api';
jest.mock('./src/services/api');

test('api.post is mocked', () => {
  api.post = jest.fn().mockResolvedValue({ success: true, data: {} });
  api.post('/test', { foo: 'bar' });
  expect(api.post).toHaveBeenCalledWith('/test', { foo: 'bar' });
});
