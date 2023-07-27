import React, { useEffect, useState } from 'react';
import {MaterialIcons} from "@expo/vector-icons";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
  Alert,
  Modal,
} from 'react-native';
import Database from '../Database';
import {Picker} from '@react-native-picker/picker';
import { Formik } from 'formik';
import { AppRegistry, YellowBox } from 'react-native';
import App from './../App';

YellowBox.ignoreWarnings(['Warning: React.jsx']);

console.disableYellowBox = true;

AppRegistry.registerComponent('MyApp', () => App);

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
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState({
    name: '',
    description: '',
    unity: '',
    stock: '',
    price: '',
    date_exp: '',
  });
  const [isAddingMedicine, setIsAddingMedicine] = useState(false);
  
  const [showFindResult, setShowFindResult] = useState(false);
  const [medicinesFind, setMedicinesFind] = useState([]);
  const [find, setFind] = useState('');
  const [FindResult, setFindResult] = useState('');
  const [selectedValue, setSelectedValue] = useState('all');
  //Modification
  const [editMedicineName, setEditMedicineName] = useState("");
  const [editMedicineDescription, setEditMedicineDescription] = useState("");
  const [editMedicineUnity, setEditMedicineUnity] = useState("");
  const [editMedicineStock, setEditMedicineStock] = useState("");
  const [editMedicinePrice, setEditMedicinePrice] = useState("");
  const [editMedicineDate_exp, setEditMedicineDate_exp] = useState("");

  const handleValueChange = (itemValue, itemIndex) =>{
    setSelectedValue(itemValue);
    if(selectedValue == 'expired'){
      setShowFindResult(true);
      setMedicinesFind(medicines.filter((med)=>new Date(med.date_exp)>new Date()));
    }else if(selectedValue=="notExpired"){
      setShowFindResult(true);
      setMedicinesFind(medicines.filter((med)=>new Date(med.date_exp)<=new Date()));
    }else{
      setShowFindResult(false);
    }
  };

  const handleFind=()=>{
    setShowFindResult(true);
    setMedicinesFind(medicines.filter((med)=>med.name.toLowerCase().includes(find.toLowerCase())));
  }


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
    Alert.alert(
      'Confirmation',
      'Voulez-vous supprimer ce médicament?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Database.deleteMedicine(id);
            Database.getAllMedicines((medicines) => setMedicines(medicines));
          },
        },
      ],
      { cancelable: false }
    );
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
  const toggleModal2 = () => {
    setIsModalVisible2(!isModalVisible2);
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

  const handleEditSubmit = (values) => {
   // console.log(values,selectedMedicineId);
    Database.updateMedicine(values.id, values.name, values.description,values.unity,  parseInt(values.price) , parseInt(values.stock) , values.date_exp);
    setIsModalVisible2(false);
    Database.getAllMedicines((medicines) => setMedicines(medicines));
  };

  const toggleAddingMedicine = () => {
    setIsAddingMedicine(!isAddingMedicine);
  };
  const initialValues = {
    id: selectedMedicine.id,
    name: selectedMedicine.name, 
    description:selectedMedicine.description,
    unity:selectedMedicine.unity,
    stock:selectedMedicine.stock.toString(),
    price:selectedMedicine.price.toString(),
    date_exp:selectedMedicine.date_exp  , 
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Pharmacie</Text>

        {!isAddingMedicine && (
          <View>
          {showFindResult && <MaterialIcons
           name='arrow-back' 
            size={25}
            onPress={()=>{setShowFindResult(false)}}
          />}
          {/* {showFindResult &&  <Button title='Afficher tout' onPress={()=>{setShowFindResult(false)}}/>} */}
            <View style={{flexDirection: 'row', 
           alignItems: 'center', 
            justifyContent: 'center', 
          paddingHorizontal: 5,
          paddingVertical: 4,}}> 
              <TextInput
                style={{ flex: 1, 
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 8,
                marginRight: 8,
                borderRadius:20}}
                placeholder="Saisissez le médicament..."
                value={find}
                onChangeText={setFind}
              /> 
              <TouchableOpacity onPress={handleFind} style={{marginLeft:10, borderWidth:1,padding:5,borderRadius:15,borderColor:"#ccc"}}>
                  <MaterialIcons
                    name='search'
                    size={30}
                  />
              </TouchableOpacity>
            </View> 
            <View style={{borderWidth: 1,
            borderColor: '#ccc',
            borderRadius:20,
            size:1}}>
            <Picker 
                selectedValue={selectedValue}
                style={styles.picker}
                value="all"
                onValueChange={handleValueChange}
              >
                <Picker.item label="Selectionner" value=""/>
                <Picker.item label="Expiré" value="expired"/>
                <Picker.item label="Non expiré" value="notExpired"/>
              </Picker>
            </View>
            
            

            <TouchableOpacity    style={{flexDirection:"row",justifyContent:"center",marginTop:10, marginHorizontal:10, textAlign:"center",backgroundColor:"#969696",borderColor:"f2f2f2",padding:10,borderRadius:10,marginBottom:15}} onPress={toggleAddingMedicine}>
             <Text style={{color:"white",textAlign:"center"}}>Nouveau Médicament</Text> 
              {/* <MaterialIcons 
                name="add"
                size={20}
                color="white"
              /> */}
            </TouchableOpacity>
          </View> 
        )}

        {isAddingMedicine && (
          <View style={styles.addMedicineContainer}>
            <Text style={{fontSize:20,fontWeight:"bold",marginVertical:10,textAlign:'center'}}>Nouveau Médicament:</Text>
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
            <TouchableOpacity style={styles.actionCancelButton} onPress={toggleAddingMedicine}>
              <Text style={styles.actionCancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}

       {!showFindResult && <FlatList
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
              <Text style={{ marginVertical: 1 }}></Text>
              <View style={styles.operations}>
                <TouchableOpacity   onPress={() => {
                    setSelectedMedicineId(item.id);
                    toggleModal();
                  }}
                  style={styles.operationButton}>
                <Text style={styles.actionCancelButtonText}>Opération</Text>
                </TouchableOpacity>

                <TouchableOpacity  style={styles.actionEditButton}  onPress={() => {
                    setSelectedMedicineId(item.id);
                    setSelectedMedicine(item);
                    toggleModal2();
                  }}
                 >
                 <Text style={styles.actionCancelButtonText}>Modifier</Text>
                
                </TouchableOpacity>
                <TouchableOpacity  
                style={styles.actionCancelButton}
                 onPress={() => {
                    deleteMedicine(item.id);
                  }}
                 >
                    <Text style={styles.actionCancelButtonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}
        />}
       {showFindResult && <FlatList
          style={styles.medicinesList}
          data={medicinesFind}
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
              <Text style={{ marginVertical: 1 }}></Text>
              <View style={styles.operations}>
                <TouchableOpacity  onPress={() => {
                    setSelectedMedicineId(item.id);
                    toggleModal();
                  }}
                  style={styles.operationButton}>
                  <Text style={styles.actionCancelButtonText}>Opération</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={styles.actionEditButton}
                onPress={() => {
                    setSelectedMedicineId(item.id);
                    setSelectedMedicine(item);
                    toggleModal2();
                  }}>
                  <Text style={styles.actionCancelButtonText}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity
                 onPress={() => {
                    deleteMedicine(item.id);
                  }}
                  style={styles.actionCancelButton}>
                  <Text style={styles.actionCancelButtonText}>Supprimer</Text>
                </TouchableOpacity>
                
              </View>

            </View>
          )}
        />}
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
        <Modal animationType="slide" transparent={true} visible={isModalVisible2}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Modfication</Text>
                <Formik
                    initialValues={initialValues}
                    onSubmit={handleEditSubmit}
                  >
                    {({ handleChange, handleBlur, handleSubmit, values }) => (
                      <View>
                      <Text>Nom</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Name"
                          onChangeText={handleChange('name')}
                          onBlur={handleBlur('name')}
                          value={values.name}
                        />
                        <Text>Description</Text>
                         <TextInput
                          style={styles.input}
                          placeholder="description"
                          onChangeText={handleChange('description')}
                          onBlur={handleBlur('description')}
                          value={values.description}
                        />
                        <Text>Unité</Text>
                         <TextInput
                          style={styles.input}
                          placeholder="unity"
                          onChangeText={handleChange('unity')}
                          onBlur={handleBlur('unity')}
                          value={values.unity}
                        />
                        <Text>Stock</Text>
                         <TextInput
                          style={styles.input}
                          placeholder="stock"
                          onChangeText={handleChange('stock')}
                          onBlur={handleBlur('stock')}
                          value={values.stock}
                          keyboardType="numeric"
                        />
                        <Text>Prix</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="price"
                          onChangeText={handleChange('price')}
                          onBlur={handleBlur('price')}
                          value={values.price}
                          keyboardType="numeric"
                        />
                        <Text>Date d'expiration</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="YYYY-MM-DD"
                          onChangeText={handleChange('date_exp')}
                          onBlur={handleBlur('date_exp')}
                          value={values.date_exp}
                        />
                        <Button title="Modifier" onPress={handleSubmit} style={{ marginVertical: 10 }}/>
                        <Text></Text>
                        <TouchableOpacity style={styles.actionCancelButton} onPress={toggleModal2}>
                               <Text style={styles.actionCancelButtonText}>Annuler</Text>
                         </TouchableOpacity>
                      </View>
                    )}
                  </Formik>
            </View>
          </View>
        </Modal>
      </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    width: '100%',
    color: 'white',
    paddingVertical:10,
    backgroundColor: '#494949'
    
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
    backgroundColor: '#d83232',
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
    width: '80%',
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
    backgroundColor: '#2795c0',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
  },
  actionEditButton: {
    backgroundColor: '#1d9c43',
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
    backgroundColor: '#1d9c43',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  actionSubmitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionCancelButton: {
    backgroundColor: '#d83232',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 0,
  },
  actionCancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  operations: {
    marginTop:8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  operationButton: {
    backgroundColor: '#2795c0',
    borderRadius: 5,
    padding: 10,
    flex: 1, 
    marginRight: 5, 
  },
  deleteButton: {
    backgroundColor: '#d83232', 
    borderRadius: 5,
    padding: 10,
    flex: 1, 
    marginLeft: 5, 
  },
  input: {
    borderWidth: 0.8, 
    borderColor: '#ccc', 
    borderRadius: 5,
    padding: 3,
    marginBottom: 10,
    fontSize: 14, 
  },
});
export default HomeScreen;
