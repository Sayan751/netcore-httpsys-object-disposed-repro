import img from '../../images/jonas-jacobsson-L5pXo1eqCEg-unsplash.jpg';
export class PageTwo {
  private img = img;
  private keys: number[] = Array.from({ length: 32 - 2 }, (_, i) => i + 2);
}
