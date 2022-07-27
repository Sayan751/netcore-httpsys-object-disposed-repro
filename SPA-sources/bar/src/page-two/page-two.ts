import img from '../../images/jack-ward-yioXiArPF9Y-unsplash.jpg';
export class PageTwo {
  private img = img;
  private keys: number[] = Array.from({ length: 32 - 2 }, (_, i) => i + 2);
}
