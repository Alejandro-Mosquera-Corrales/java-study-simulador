import javax.swing.*;

public class Main {
    public static void main(String args[]) {
        Lista lista = new Lista();
        int opcion = 0;

        do {
            String menu = "==============================\n" +
                          "        MENÚ PRINCIPAL        \n" +
                          "==============================\n" +
                          "1. Mostrar empleados y registrar al INICIO.\n" +
                          "2. Mostrar empleados y registrar al FINAL.\n" +
                          "3. Buscar / Eliminar empleado por código.\n" +
                          "4. Modificar salario de un empleado.\n" +
                          "5. Ordenar la lista de empleados.\n" +
                          "6. Salir.\n\n" +
                          "Digite una opción:";

            String input = JOptionPane.showInputDialog(menu);
            if (input == null) {
                break; // Si se presiona cancelar
            }

            try {
                opcion = Integer.parseInt(input);
            } catch (NumberFormatException e) {
                JOptionPane.showMessageDialog(null, "Por favor, digite un número válido.");
                continue;
            }

            switch (opcion) {
                case 1:
                    JOptionPane.showMessageDialog(null, "--- LISTA DE EMPLEADOS ---\n" + lista.visualizar());
                    
                    Empleado emp1 = new Empleado();
                    emp1.setCodigo(Integer.parseInt(JOptionPane.showInputDialog("Digite el código del empleado:")));
                    emp1.setNombre(JOptionPane.showInputDialog("Digite el nombre del empleado:"));
                    emp1.setSalario(Double.parseDouble(JOptionPane.showInputDialog("Digite el salario del empleado:")));
                    
                    lista.insertarCabezaLista(emp1);
                    JOptionPane.showMessageDialog(null, "Empleado registrado al inicio exitosamente.");
                    break;

                case 2:
                    JOptionPane.showMessageDialog(null, "--- LISTA DE EMPLEADOS ---\n" + lista.visualizar());
                    
                    Empleado emp2 = new Empleado();
                    emp2.setCodigo(Integer.parseInt(JOptionPane.showInputDialog("Digite el código del empleado:")));
                    emp2.setNombre(JOptionPane.showInputDialog("Digite el nombre del empleado:"));
                    emp2.setSalario(Double.parseDouble(JOptionPane.showInputDialog("Digite el salario del empleado:")));
                    
                    lista.insertarFinalLista(emp2);
                    JOptionPane.showMessageDialog(null, "Empleado registrado al final exitosamente.");
                    break;

                case 3:
                    int codigoBuscar = Integer.parseInt(JOptionPane.showInputDialog("Digite el código del empleado a buscar:"));
                    Nodo encontrado = lista.buscar(codigoBuscar);
                    
                    if (encontrado != null) {
                        Empleado emp = (Empleado) encontrado.getDato();
                        String info = "¡Empleado encontrado!\n" +
                                      "Código: " + emp.getCodigo() + "\n" +
                                      "Nombre: " + emp.getNombre() + "\n" +
                                      "Salario: $" + emp.getSalario();
                        JOptionPane.showMessageDialog(null, info);

                        int confirmar = JOptionPane.showConfirmDialog(null, "¿Desea eliminar este empleado?", "Eliminar Empleado", JOptionPane.YES_NO_OPTION);
                        if (confirmar == JOptionPane.YES_OPTION) {
                            lista.eliminar(codigoBuscar);
                            JOptionPane.showMessageDialog(null, "Empleado eliminado correctamente.");
                        }
                    } else {
                        JOptionPane.showMessageDialog(null, "El empleado con código " + codigoBuscar + " NO existe en la lista.");
                    }
                    break;

                case 4:
                    int codigoMod = Integer.parseInt(JOptionPane.showInputDialog("Digite el código del empleado a modificar:"));
                    Nodo nodoMod = lista.buscar(codigoMod);
                    
                    if (nodoMod != null) {
                        Empleado emp = (Empleado) nodoMod.getDato();
                        double nuevoSalario = Double.parseDouble(JOptionPane.showInputDialog(
                                "Empleado: " + emp.getNombre() + "\nSalario actual: $" + emp.getSalario() + "\n\nDigite el nuevo salario:"));
                        
                        lista.modificarSalario(codigoMod, nuevoSalario);
                        JOptionPane.showMessageDialog(null, "Salario modificado exitosamente.");
                    } else {
                        JOptionPane.showMessageDialog(null, "El empleado con código " + codigoMod + " NO existe.");
                    }
                    break;

                case 5:
                    lista.ordenarLista();
                    JOptionPane.showMessageDialog(null, "Lista ordenada por código exitosamente:\n\n" + lista.visualizar());
                    break;

                case 6:
                    JOptionPane.showMessageDialog(null, "Saliendo del programa. ¡Hasta luego!");
                    break;

                default:
                    JOptionPane.showMessageDialog(null, "Opción no válida. Intente de nuevo.");
                    break;
            }

        } while (opcion != 6);
    }
} 

