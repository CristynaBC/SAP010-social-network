import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';

import { db, onAuthStateChanged } from 'firebase/auth';

import { expect } from '@jest/globals';

import {
  criarPost,
  carregarPosts,
  createUserData,
  checkAuthor,
} from '../src/lib/firestore';

jest.mock('firebase/firestore');
jest.mock('firebase/auth');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('criarPost', () => {
  const mockPost = {
    idadePet: 'filhote',
    especie: 'Cachorro',
    sexo: 'Fêmea',
    raca: 'Labrador Retriever',
    localizacao: 'São Paulo',
    contato: '999999999999',
    mensagem: 'Este é um cão adorável em busca de um lar!',
  };

  it('deve criar um post', async () => {
    await criarPost(mockPost);

    expect(collection).toHaveBeenCalledWith(db, 'post');
    expect(addDoc).toHaveBeenCalledWith(collection(), mockPost);
  });
});

describe('carregarPosts', () => {
  it('deve carregar os posts', async () => {
    const querySnapshotMock = {
      docs: [
        { id: 'postA', data: () => ({ titulo: 'Post A', conteudo: 'Quero adotar um Pet' }) },
      ],
    };

    getDocs.mockResolvedValueOnce(querySnapshotMock);

    const retornar = await carregarPosts();

    expect(getDocs).toHaveBeenCalledTimes(1);
    expect(retornar).toEqual([
      { id: 'postA', titulo: 'Post A', conteudo: 'Quero adotar um Pet' },
    ]);
  });
});

describe('createUserData', () => {
  it('deve criar os dados dos usuários quando passar pela autenticação', async () => {
    const mockUser = { uid: 'id' };
    const mockNome = 'nome';

    onAuthStateChanged.mockImplementationOnce((auth, callback) => callback(mockUser));

    await createUserData(mockNome);

    expect(collection).toHaveBeenCalledWith(db, 'usernames');
    expect(addDoc).toHaveBeenCalledWith(collection(), {
      name: mockNome,
      userId: mockUser.uid,
    });
  });
});

describe('checkAuthor', () => {
  beforeEach(() => {
    jest.setTimeout(20000);
  });
  it('deve checar se o usuário logado é o autor das suas postagens', async () => {
    const mockPostId = 'postA';
    const mockCurrentUserId = 'userABC';

    const mockAuth = {
      getCurrentUserId: jest.fn().mockResolvedValue(mockCurrentUserId),
    };

    const mockDocSnapshot = {
      exists: true,
      data: jest.fn(),
    };
    getDoc.mockResolvedValue(mockDocSnapshot);

    const resultado = await checkAuthor(mockPostId, mockAuth);

    expect(getDoc).toHaveBeenCalledWith(doc(db, 'post', mockPostId));
    expect(mockAuth.getCurrentUserId).toHaveBeenCalledTimes(1);
    expect(resultado).toBe(true);
  });
});
