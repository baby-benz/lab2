package lab1;
public class Polynomial extends ArraysFractions {
    public Polynomial(Fraction a, Fraction b){
        super(a,b);
    }

    public Fraction x(Fraction x, Fraction y){
         Fraction ax = Fraction.multiply(x, this.arrays.get(0));
         Fraction by = Fraction.multiply(y, this.arrays.get(1));
         return Fraction.add(ax, by);
    }
}
