//NO PUDE USAR FAKER ENTONCES TUVE QUE HACER ESTO

const random = (len = 7) => Math.random().toString(36).substring(2, 2 + len);

export const faker = {
  company: {
    name: () => `Company ${random()}`,
  },
  lorem: {
    sentence: () => `Sentence ${random(20)}`,
  },
  address: {
    secondaryAddress: () => `Street ${random()}`,
    city: () => `City ${random(4)}`,
  },
  location: {
    streetAddress: () => `Street ${random()}`,
    city: () => `City ${random(4)}`,
  },
  image: {
    imageUrl: (seed?: number) => (seed !== undefined ? `https://picsum.photos/seed/${seed}/200/200` : `https://picsum.photos/200/200?random=${random()}`),
    url: (seed?: number) => (seed !== undefined ? `https://picsum.photos/seed/${seed}/200/200` : `https://picsum.photos/200/200?random=${random()}`),
  }
};

export default faker;
