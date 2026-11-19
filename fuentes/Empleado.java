public class Empleado {
    private String nombre;
    private int codigo;
    private double salario;

    public Empleado() {
        this.nombre = "";
        this.codigo = 0;
        this.salario = 0.0;
    }

    public Empleado(int codigo, String nombre, double salario) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.salario = salario;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setCodigo(int codigo) {
        this.codigo = codigo;
    }

    public void setSalario(double salario) {
        this.salario = salario;
    }

    public String getNombre() {
        return nombre;
    }

    public int getCodigo() {
        return codigo;
    }

    public double getSalario() {
        return salario;
    }
}
    

