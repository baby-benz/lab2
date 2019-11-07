package lab1;

import static org.junit.Assert.assertEquals;


import org.junit.Test;


/**
 * Unit test for simple App.
 */
public class MainClassTest
{
    /**
     * Rigorous Test :-)
     */
    @Test
    public void sum(){
        Fraction a = new Fraction(1,2);
        Fraction b = new Fraction(1,3);
        Fraction rez = Fraction.add(a, b);
        assertEquals(new Fraction(5,6), rez);
    }
    @Test
    public void check(){
        boolean actual = true;
        try {
             Fraction r0 = new Fraction(1, 0);
        } catch (IllegalArgumentException e) {
             actual = false;
        }
        boolean expected = false;
        assertEquals(expected, actual);
    }
    
}
