let isUpdate = false
let contactObj = {}
let server_url = " http://localhost:3000/AddressBookDB/";
window.addEventListener("DOMContentLoaded", (event) => {
  //validate first name
  const name = document.querySelector("#name");
  name.addEventListener("input", function(){
    if (name.value.length == 0) {
      setTextValue(".name-error", "")
      return;
    }
    try {
      checkName(name.value)
      setTextValue(".name-error", "")
    } catch (error) {
      setTextValue(".name-error", error)
    }
  });

  //validation for phone number
  const phoneNumber = document.querySelector("#phoneNumber");
  phoneNumber.addEventListener("input", function () {
    if (phoneNumber.value.length == 0) {
      setTextValue(".tel-error", "")
      return;
    }
    try {
      checkNumber(phoneNumber.value)
      setTextValue(".tel-error", "")
    } catch (error) {
      setTextValue(".tel-error", error);
    }
  });

  //validation for zip code
  const zip = document.querySelector("#zip");
  zip.addEventListener("input", function () {
    if (zip.value.length == 0) {
      setTextValue(".zip-error", "")
      return;
    }
    try {
      checkZip(zip.value)
      setTextValue(".zip-error", "")
    } catch (error) {
      setTextValue(".zip-error", error)
    }
  });
  checkForUpdate();
  localStorage.removeItem('contactEdit')
});

function save() {
  try {
    setContactObject()
    if (site_properties.use_local_storage.match("true")) {
      resetForm()
      createAndUpdateStorage()
      resetForm()
      window.location.replace(site_properties.home_page)
    } else {
      createAndUpdateContactInServer()
    }
  } catch (error) {
    alert(error);
  }
}

function createAndUpdateStorage() {
  let contactList = JSON.parse(localStorage.getItem("ContactList"))
  if (contactList != undefined) {
    let contactData = contactList.find(contactData => contactData.id == contactObj.id)
    if (!contactData) {
      contactList.push(contactObj)
    } else {
      const index = contactList.map(contactData => contactData.id).indexOf(contactData.id)
      contactList.splice(index, 1, contactObj)
    }
  } else {
    contactList = [contactObj]
  }
  localStorage.setItem("ContactList", JSON.stringify(contactList))
}

function createAndUpdateContactInServer() {
  let postUrl = site_properties.server_url
  let methodCall = "POST"
  if (isUpdate) {
    methodCall = "PUT"
    postUrl = postUrl + contactObj.id.toString()
  }
  makePromiseCall(methodCall, postUrl, true, contactObj)
    .then(
      (responseText) => {
        resetForm()
        window.location.replace(site_properties.home_page)
      }
    )
    .catch(
      (error) => {
        throw error
      }
    );
}

function getInputValueById(property) {
  let value = document.querySelector(property).value;
  return value;
}

function resetForm() {
  setValue("#name", "");
  setValue("#phoneNumber", "");
  setValue("#address", "");
  setValue("#city", "Select City");
  setValue("#state", "Select State");
  setValue("#zip", "");
}

function setValue(id, value) {
  const element = document.querySelector(id);
  element.value = value;
}

function checkForUpdate() {
  const contactJson = localStorage.getItem('contactEdit')
  isUpdate = contactJson ? true : false;
  if (!isUpdate) {
    return
  }
  contactObj = JSON.parse(contactJson)
  setForm()
}

function setForm() {
  setValue("#name", contactObj._name)
  setValue("#phoneNumber", contactObj._phoneNumber);
  setValue("#address", contactObj._address);
  setValue("#city", contactObj._city);
  setValue("#state", contactObj._state);
  setValue("#zip", contactObj._zip);
}

function generateId() {
  let contactId = localStorage.getItem("ContactID")
  contactId = !contactId ? 1 : (parseInt(contactId) + 1).toString()
  localStorage.setItem("ContactID", contactId)
  return contactId
}

function setContactObject() {
  if (!isUpdate && site_properties.use_local_storage.match("true")) {
    contactObj.id = generateId()
  }
  try {
    checkName(getInputValueById("#name"))
    contactObj._name = getInputValueById("#name");
  } catch (error) {
    setTextValue(".name-error", error);
    throw error;
  }

  try {
    checkNumber(getInputValueById("#phoneNumber"))
    contactObj._phoneNumber = getInputValueById("#phoneNumber");
  } catch (error) {
    setTextValue(".tel-error", error);
    throw error
  }
  contactObj._address = getInputValueById("#address");
  let city = getInputValueById("#city");
  if (city != "Select City") {
    contactObj._city = city;
  } else {
    throw "Please select city";
  }
  let state = getInputValueById("#state");
  if (state != "Select State") {
    contactObj._state = state;
  } else {
    throw "Please select state";
  }
  try {
    checkZip(getInputValueById("#zip"))
    contactObj._zip = getInputValueById("#zip");
  } catch (error) {
    setTextValue(".zip-error", error);
    throw error
  }
}

function setTextValue(component, problem) {
  let textError = document.querySelector(component);
  textError.textContent = problem
}