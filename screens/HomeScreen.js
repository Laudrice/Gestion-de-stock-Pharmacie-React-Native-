import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
  Alert,
  Modal,
} from 'react-native';
import Database from '../Database';

const HomeScreen = () => {
  const [medicines, setMedicines] = useState([]);
  const [quantityOutput, setQuantityOutput] = useState(0);
  const [quantityInput, setQuantityInput] = useState(0);
  const [newMedicineName, setNewMedicineName] = useState('');
  const [newMedicineDescription, setNewMedicineDescription] = useState('');
  const [newMedicineUnity, setNewMedicineUnity] = useState('');
  const [newMedicineStock, setNewMedicineStock] = useState('');
  const [newMedicinePrice, setNewMedicinePrice] = useState('');
  const [newMedicineDate_exp, setNewMedicineDate_exp] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState(null);
  const [isAddingMedicine, setIsAddingMedicine] = useState(false);

  const isExpired = (date) => {
    const currentDate = new Date();
    const expirationDate = new Date(date);
    return expirationDate < currentDate;
  };

  useEffect(() => {
    Database.createTable();
    Database.getAllMedicines((medicines) => setMedicines(medicines));
  }, []);

  const addMedicine = () => {
    if (newMedicineName && newMedicineDescription) {
      Database.insertMedicine(
        newMedicineName,
        newMedicineDescription,
        newMedicineUnity,
        parseInt(newMedicineStock),
        parseInt(newMedicinePrice),
        newMedicineDate_exp
      );
      setNewMedicineName('');
      setNewMedicineDescription('');
      setNewMedicineUnity('');
      setNewMedicineStock('');
      setNewMedicinePrice('');
      setNewMedicineDate_exp('');
      Database.getAllMedicines((medicines) => setMedicines(medicines));
      setIsAddingMedicine(false);
    }
  };

  const deleteMedicine = (id) => {
    Database.deleteMedicine(id);
    Database.getAllMedicines((medicines) => setMedicines(medicines));
  };

  const inputMed = (id, qte) => {
    Database.putMedicine(id, qte);
    Database.getAllMedicines((medicines) => setMedicines(medicines));
  };

  const outputMed = (id, qte, stock) => {
    const qteOut = -qte;
    if (stock >= qte) {
      Database.putMedicine(id, qteOut);
      Database.getAllMedicines((medicines) => setMedicines(medicines));
    } else {
      Alert.alert('Stock insuffisant');
    }
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleActionSubmit = () => {
    if (selectedAction === 'entrée') {
      inputMed(selectedMedicineId, parseInt(quantityInput));
    } else if (selectedAction === 'sortie') {
      outputMed(
        selectedMedicineId,
        parseInt(quantityOutput),
        medicines.find((m) => m.id === selectedMedicineId).stock
      );
    }
    setIsModalVisible(false);
  };

  const toggleAddingMedicine = () => {
    setIsAddingMedicine(!isAddingMedicine);
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Gestion de stock de médicaments</Text>

        {!isAddingMedicine && (
          <TouchableOpacity style={styles.addButton} onPress={toggleAddingMedicine}>
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
        )}

        {isAddingMedicine && (
          <View style={styles.addMedicineContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nom du médicament"
              value={newMedicineName}
              onChangeText={setNewMedicineName}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newMedicineDescription}
              onChangeText={setNewMedicineDescription}
            />
            <TextInput
              style={styles.input}
              placeholder="Unité"
              value={newMedicineUnity}
              onChangeText={setNewMedicineUnity}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantité"
              keyboardType="numeric"
              value={newMedicineStock}
              onChangeText={setNewMedicineStock}
            />
            <TextInput
              style={styles.input}
              placeholder="Prix"
              keyboardType="numeric"
              value={newMedicinePrice}
              onChangeText={setNewMedicinePrice}
            />
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={newMedicineDate_exp}
              onChangeText={setNewMedicineDate_exp}
            />
            <TouchableOpacity style={styles.addButton} onPress={addMedicine}>
              <Text style={styles.addButtonText}>Valider</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={toggleAddingMedicine}>
              <Text style={styles.addButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          style={styles.medicinesList}
          data={medicines}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.medicineItem}>
              <Text style={styles.medicineName}>{item.name}</Text>
              <Text>Description: {item.description}</Text>
              <Text>Unité: {item.unity}</Text>
              <Text>Stock: {item.stock}</Text>
              <Text>Prix: {item.price}</Text>
              <Text>
                Date d'expiration: {item.date_exp} {isExpired(item.date_exp) ? 'Expiré' : 'Non expiré'}
              </Text>
              <View style={styles.operations}>
  <Button
    title="Opération"
    onPress={() => {
      setSelectedMedicineId(item.id);
      toggleModal();
    }}
    style={styles.operationButton}
  />
  <Button
    title="Delete"
    onPress={() => {
      deleteMedicine(item.id);
    }}
    style={styles.deleteButton}
  />
</View>

            </View>
          )}
        />

        <Modal animationType="slide" transparent={true} visible={isModalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sélectionner une action</Text>
              <View style={styles.actionPicker}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setSelectedAction('entrée')}
                >
                  <Text style={styles.actionButtonText}>Entrée</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setSelectedAction('sortie')}
                >
                  <Text style={styles.actionButtonText}>Sortie</Text>
                </TouchableOpacity>
              </View>
              {selectedAction === 'entrée' && (
                <View style={styles.actionInputContainer}>
                  <TextInput
                    style={styles.actionInput}
                    placeholder="Quantité d'entrée"
                    keyboardType="numeric"
                    value={quantityInput}
                    onChangeText={setQuantityInput}
                  />
                  <TouchableOpacity
                    style={styles.actionSubmitButton}
                    onPress={handleActionSubmit}
                  >
                    <Text style={styles.actionSubmitButtonText}>Valider</Text>
                  </TouchableOpacity>
                </View>
              )}
              {selectedAction === 'sortie' && (
                <View style={styles.actionInputContainer}>
                  <TextInput
                    style={styles.actionInput}
                    placeholder="Quantité de sortie"
                    keyboardType="numeric"
                    value={quantityOutput}
                    onChangeText={setQuantityOutput}
                  />
                  <TouchableOpacity
                    style={styles.actionSubmitButton}
                    onPress={handleActionSubmit}
                  >
                    <Text style={styles.actionSubmitButtonText}>Valider</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity style={styles.actionCancelButton} onPress={toggleModal}>
                <Text style={styles.actionCancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    // </KeyboardAwareScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: 'blue',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addMedicineContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 20,
  },
  medicinesList: {
    marginBottom: 20,
  },
  medicineItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  deleteButtonText: {
    color: 'whire',
    fontWeight: 'bold',
    backgroundColor: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  actionPicker: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: 'blue',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  actionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  actionSubmitButton: {
    backgroundColor: 'blue',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  actionSubmitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionCancelButton: {
    backgroundColor: 'red',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 0,
  },
  actionCancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  operations: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  operationButton: {
    backgroundColor: 'blue',
    borderRadius: 5,
    padding: 10,
    flex: 1, 
    marginRight: 5, 
  },
  deleteButton: {
    backgroundColor: 'red', 
    borderRadius: 5,
    padding: 10,
    flex: 1, 
    marginLeft: 5, 
  },
});
export default HomeScreen;
