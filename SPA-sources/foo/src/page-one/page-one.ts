import img from '../../images/jonas-jacobsson-hme6i6hI89s-unsplash.jpg';

export class PageOne {
  private img = img;
  private keys: number[] = Array.from({ length: 82 - 2 }, (_, i) => i + 2);
}
