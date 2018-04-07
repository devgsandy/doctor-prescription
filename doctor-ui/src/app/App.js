import React, { Component } from 'react';
import { remove } from 'lodash';
import { Button, Col, Input, Row, Icon } from 'react-materialize';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import './App.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const headers = ['#', 'Medicine Name', 'Usage Time', 'Days', 'Note'];
const printHeaderMargin = 20;
const initialState = {
  name: '',
  age: '',
  selectedMedicine: '',
  medicines: [],
};

class App extends Component {

  state = initialState;

  handleChange = (selectedMedicine) => {
    this.setState({ selectedMedicine });
  };

  onInputKeyDown = (event) => {
    if (event.keyCode === 13) {
      setTimeout(this.onAddMedicine);
    }
  };

  onAddMedicine = () => {
    if (!this.state.selectedMedicine) {
      return;
    }
    this.state.medicines.push({
      uniqId: Date.now(),
      medicine: this.state.selectedMedicine,
      usageTime: '0-0-0',
      days: '0',
      notes: '',
    });
    this.setState({
      medicines: this.state.medicines.slice(),
      selectedMedicine: '',
    });
  };

  onRemoveMedicine = (medicine) => {
    remove(this.state.medicines, med => med.uniqId === medicine.uniqId);
    this.setState({ medicines: this.state.medicines.slice() });
  };

  onChangeFieldValue = (medicine, field, event) => {
    medicine[field] = event.target.value;
    this.setState({ medicines: this.state.medicines.slice() });
  };

  onPrint = () => {

    const headerMargin = (v) => printHeaderMargin + v;

    const doc = new jsPDF();
    const col = headers;
    const rows = [];

    this.state.medicines.forEach((val, i) => {
      rows.push([i + 1, val.medicine.value, val.usageTime, val.days, val.notes]);
    });

    doc.setFontSize(11);
    doc.text(`Date:  ${new Date().toDateString()}`, 140, headerMargin(11));
    doc.text(`Patient Name:  ${this.state.name}`, 14, headerMargin(22));
    doc.text(`Patient Age:  ${this.state.age}`, 140, headerMargin(22));
    doc.setTextColor(100);


    doc.autoTable(col, rows, { startY: headerMargin(30) });

    doc.setFontSize(11);
    doc.text('Doctor Signature', 140, doc.autoTable.previous.finalY + 15);

    doc.save(`prescription_${this.state.name}_${this.state.age}.pdf`);
  };

  onReset = () => {
    this.setState({ ...initialState });
  };

  getMedicineNames = (input) => {
    if (!input) {
      return Promise.resolve({ options: [] });
    }

    return fetch(`/suggestion?searchstr=${input}`)
      .then((response) => response.json())
      .then((json) => {
        return { options: json.suggestions };
      });
  };

  render() {

    const { selectedMedicine } = this.state;
    const value = selectedMedicine && selectedMedicine.value;

    return (
      <div>

        <Row>
          <Input s={6} onChange={(e) => this.setState({ name: e.target.value })} label="Patient Name"
                 value={this.state.name}/>
          <Input s={6} onChange={(e) => this.setState({ age: e.target.value })} label="Age" value={this.state.age}/>
        </Row>
        <Row>
          <Col s={10}>
            <Select.Async
              value={value}
              onChange={this.handleChange}
              onInputKeyDown={this.onInputKeyDown}
              valueKey="value"
              labelKey="value"
              loadOptions={this.getMedicineNames}
              backspaceRemoves={true}
            />
          </Col>
          <Col s={2}>
            <Button onClick={this.onAddMedicine} floating large className='red' waves='light' icon='add'/>
          </Col>
        </Row>

        <table>
          <thead>
          <tr>
            {headers.map(h => (
              <th key={h}>{h}</th>
            ))}
            <th></th>
          </tr>
          </thead>

          <tbody>
          {this.state.medicines.map((med, index) => (
            <tr key={med.uniqId}>
              <td>{index + 1}</td>
              <td>{med.medicine.value}</td>
              <td>
                <Row>
                  <Input onChange={event => this.onChangeFieldValue(med, 'usageTime', event)} value={med.usageTime}
                         label="Usage Time"/>
                </Row>
              </td>
              <td>
                <Row>
                  <Input onChange={event => this.onChangeFieldValue(med, 'days', event)} value={med.days} label="Days"/>
                </Row>
              </td>
              <td>
                <Row>
                  <Input onChange={event => this.onChangeFieldValue(med, 'notes', event)} value={med.notes}
                         label="Notes"/>
                </Row>
              </td>
              <td>
                <a onClick={(e) => {
                  e.preventDefault();
                  this.onRemoveMedicine(med);
                }}><i className="material-icons">delete</i></a>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
        <Row>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button onClick={this.onPrint} waves='light'>Print<Icon right>cloud</Icon></Button>
            <Button style={{ marginLeft: '10px' }} onClick={this.onReset} waves='light'>Reset</Button>
          </div>
        </Row>
      </div>
    );
  }
}

export default App;
