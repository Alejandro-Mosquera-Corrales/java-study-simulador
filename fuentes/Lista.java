public class Lista {
    private Nodo cabeza;

    public Lista() {
        cabeza = null;
    }

    public void insertarCabezaLista(Object dato) {
        Nodo nuevo = new Nodo(dato);
        nuevo.setSiguiente(cabeza);
        cabeza = nuevo;
    }

    public void insertarFinalLista(Object dato) {
        Nodo nuevo = new Nodo(dato);
        if (cabeza == null) {
            cabeza = nuevo;
        } else {
            Nodo actual = cabeza;
            while (actual.getSiguiente() != null) {
                actual = actual.getSiguiente();
            }
            actual.setSiguiente(nuevo);
        }
    }

    public Object obtenerCodigo(Nodo n) {
        return ((Empleado) n.getDato()).getCodigo();
    }

    public Object obtenerNombre(Nodo n) {
        return ((Empleado) n.getDato()).getNombre();
    }

    public Nodo buscar(int codigo) {
        Nodo actual = cabeza;
        while (actual != null) {
            if (((Empleado) actual.getDato()).getCodigo() == codigo) {
                return actual;
            }
            actual = actual.getSiguiente();
        }
        return null;
    }

    public boolean eliminar(int codigo) {
        Nodo actual = cabeza, anterior = null;

        while ((actual != null) && (((Empleado) actual.getDato()).getCodigo() != codigo)) {
            anterior = actual;
            actual = actual.getSiguiente();
        }

        if (actual != null) {
            if (actual == cabeza) {
                cabeza = cabeza.getSiguiente();
            } else {
                anterior.setSiguiente(actual.getSiguiente());
            }
            actual = null;
            return true;
        }
        return false;
    }


    public boolean modificarSalario(int codigo, double nuevoSalario) {
        Nodo nodoBuscado = buscar(codigo);
        if (nodoBuscado != null) {
            Empleado emp = (Empleado) nodoBuscado.getDato();
            emp.setSalario(nuevoSalario);
            return true;
        }
        return false;
    }


    public void ordenarLista() {
        if (cabeza == null || cabeza.getSiguiente() == null) {
            return;
        }
        boolean cambiado;
        do {
            cambiado = false;
            Nodo actual = cabeza;
            while (actual.getSiguiente() != null) {
                Empleado emp1 = (Empleado) actual.getDato();
                Empleado emp2 = (Empleado) actual.getSiguiente().getDato();
                if (emp1.getCodigo() > emp2.getCodigo()) {
                    Object temp = actual.getDato();
                    actual.setDato(actual.getSiguiente().getDato());
                    actual.getSiguiente().setDato(temp);
                    cambiado = true;
                }
                actual = actual.getSiguiente();
            }
        } while (cambiado);
    }

    public String visualizar() {
        Nodo n = cabeza;
        String cadena = "";
        if (n == null) {
            return "La lista de empleados está vacía.\n";
        }
        while (n != null) {
            Empleado emp = (Empleado) n.getDato();
            cadena += "Código: " + emp.getCodigo() + " | Nombre: " + emp.getNombre() + " | Salario: $" + emp.getSalario() + "\n";
            n = n.getSiguiente();
        }
        return cadena;
    }

    public boolean esVacia() {
        return cabeza == null;
    }
}
