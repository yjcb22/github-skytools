/**
 * Main JS code to reboot phone and delete contacts.
 *
 * @author: Yeison Camargo
 */

//Token form variables
const formsVar = document.querySelectorAll('.needs-validation');
const tokenForm = document.querySelector('.tokenBearer');
const tabsVar = document.querySelectorAll('.tabActions a');
const rebootFormVar = document.querySelector('.rebootForm');
const formReboot = document.querySelector('.formReboot');
//Token Bearer Alerts
const successBearerDiv = document.querySelector('.BearerSuccessDiv');
const successBearerH4 = document.querySelector('.BearerSuccessH4');
const successBearerP = document.querySelector('.BearerSuccessP');
const errorBearerDiv = document.querySelector('.BearerErrorDiv');
const errorBearerH4 = document.querySelector('.BearerErrorH4');
const errroBearerP = document.querySelector('.BearerErrorP');
//Action Alert
const sucessActionDiv = document.querySelector('.actionSuccessDiv');
const successActionH4 = document.querySelector('.actionSuccessH4');
const successActionP = document.querySelector('.actionSuccessP');
const errorActionDiv = document.querySelector('.actionErrorDiv');
const errorActionH4 = document.querySelector('.actionErrorH4');
const errorActionP = document.querySelector('.actionErrorP');

//Action progress alert
const progressActionDiv = document.querySelector('.actionProgressDiv');
const progressActionH4 = document.querySelector('.actionProgressH4');
const progressActionP = document.querySelector('.actionProgressP');


//Confirmation form (modal) for rebooting phones
const modalRebootVar = document.querySelector('#rebootModal');
const labelModalReboot = document.querySelector('#modalRebootConfirmationLabel');
const bodyModalReboot = document.querySelector('#modalRebootConfirmationBody');


//Actions buttons constants
const showPhonesButtonsVar = document.querySelectorAll('.showPhonesButtons label');
const rebootPhonesButtonsVar = document.querySelectorAll('.rebootPhonesButtons button');
const showAllPhones = document.querySelector('.showAllPhones');
const showRegisteredPhones = document.querySelector('.showRegisteredPhones');
const showSupportedPhones = document.querySelector('.showSupportedPhones');
const hideAllPhones = document.querySelector('.hideAllPhones');

const rebootAll = document.querySelector('.rebootAllBtn');
const rebootRegistered = document.querySelector('.rebootRegisteredBtn');
const rebootSupported = document.querySelector('.rebootSupportedBtn');
const rebootSelected = document.querySelector('.rebootSelectedBtn');


//Action show/hide phones constants
const phonesTable = document.querySelector('.phonesTab');
//Action reboot phones constant
const doActionModal = document.querySelector('.performAction');
//The variable controls the selected button that triggered the modal
let selectedButtonForModal;
//The variable will have all the selected phones from table. By default is set to 0 which means
// that none phone are selected 
let selectedPhones = 0;

//Bearer token variables. Will be set only after fetch promise has returned successfully
let bearerToken;
let apiVersion;
let domain;
let expiresTime;
let refreshToken;
let scopeValue;
let tokenType;
//let urlString = 'https://pbx.skyswitch.com/ns-ape3i/oauth2/token/';
let tokenUrl = 'https://skytools.cengtel.com/data/proxyToken.php';
let actionUrl = 'https://skytools.cengtel.com/data/proxyAction.php';

//Retrieved phones from API variable. Will be set only after getting token and requesting phones from API with fetch promise.
let phonesAllJsonObject;
let phonesRegJsonObject;
let phonesSupJsonObject;
let phonesByNodeArray = [];
let sipNodes = [];
let sipNodesClassArray = [];


////////Contacts///////////
const formContacts = document.querySelector('.formContacts');
//Actions contacts buttons contants
const showContactsButtonsVar = document.querySelectorAll('.showContactsButtons label');
const deleteContactsButtonsVar = document.querySelectorAll('.deleteContactsButtons button');
const showAllContacts = document.querySelector('.showAllContacts');
const selectAllContactsVar = document.querySelector('.selectAllContacts');
const hideAllContacts = document.querySelector('.hideAllContacts');
const contactsTable = document.querySelector('.contactsTab');
let extension = document.getElementById('contactFormUser');
let contactsCheckbox;
//Retrieved contacts from API variables. Will be set only after getting token and requesting contacts from API with fetch promise.
let contactsAllJsonObject;
let contactsExtJsonObject;
let selectedContacts = 0;



/**
 * Gets the values from theh input text in the forms. Then,
 * it creates the parameteres for the POST request
 *
 * @param {Array} form - Array containing the inputs from a form with document.querySelector.
 * @param {Object} additionalValues - JS object with additional values for the POST request (the ones not included in the form).
 * @return {FormData} - FormData object with the key/value pairs for the POST request.
 */
function getValuesFromForm(form, additionalValues = 0) {
    var myFormData;

    if (additionalValues === 0) {
        //Set credentials         
        myFormData = new FormData(form);

    } else if (form === 0) {
        myFormData = new FormData();
        let keys = Object.keys(additionalValues);
        for (let i = 0; i < keys.length; i++) {
            //console.log(keys[i] + " " + additionalValues[keys[i]]);
            myFormData.append(keys[i], additionalValues[keys[i]])

        }
    } else {
        myFormData = new FormData(form);
        let keys = Object.keys(additionalValues);
        for (let i = 0; i < keys.length; i++) {
            //console.log(keys[i] + " " + additionalValues[keys[i]]);
            myFormData.append(keys[i], additionalValues[keys[i]])

        }
    }

    //Display the key/value pairs
    // for (var pair of myFormData.entries()) {
    //     console.log(pair[0] + ', ' + pair[1]);
    // }



    return myFormData;
}

/**
 * Builds the Headers object with all the values from form, and extra values
 * for the POST request
 *
 * @param {String} urlValue - Url to sent the POST request.
 * @param {FormData} formValue - FormData returned by getValuesFromForm with the needed key/value pairs.
 * @param {number} header - Controls wether or not the POST request needs to include the header with the token bearer.
 * @return {Headers} - Headers object for the POST request.
 */
function setHttpPostParameters(urlValue, formValue, header = 0) {
    var myParameters;
    if (header === 0) {
        myParameters = new Request(urlValue, {
            method: 'POST',
            //headers: myHeaders,
            mode: 'cors',
            cache: 'default',
            body: formValue
        });
    } else {
        let myHeaders = new Headers();
        myHeaders.append('Authorization', `Bearer ${bearerToken}`);
        myParameters = new Request(urlValue, {
            method: 'POST',
            headers: myHeaders,
            mode: 'cors',
            cache: 'default',
            body: formValue
        });
    }
    return myParameters;
}


/**
 * Send a fetch (promise) with the POST request
 *
 * @param {Headers} parameters - Object with all the key/value pairs to sent the POST request.
 * @return {string} - String with the reply to the POST HTTP request.
 */
async function sendPostRequest(parameters) {
    try {
        var answer = await fetch(parameters);
        var content;

        if (!answer.ok) {
            throw new Error(`HTTP error! status: ${answer.status}`);
        } else {
            content = await answer.text(); // Here is the bearer token as txt  or reply from API             
        }
    } finally {
        console.log(`fetch attempt for "${tokenUrl}" finished.`);
    }

    return content;
}
/**
 * Glues/call all the previous functions to trigger the HTTP POST request for obtaining the token bearer. 
 * Since the answer is obtained as TXT it tries to parse it as JSON and depending on the answer it 
 * will update the corresponding alert (success/failure).
 * 
 * If the reply from the API was successful (you got a token bearer), then it will enable the tabs that 
 * has the different actions (reboot phones, and delete contacts). 
 */
async function getToken() {
    if (tokenForm.checkValidity() === true) {
        let formData = getValuesFromForm(tokenForm);
        let httpPostParam = setHttpPostParameters(tokenUrl, formData);
        let bearer = await sendPostRequest(httpPostParam);

        try {
            let tokenJson = JSON.parse(bearer);
            //assign variables from obtained token
            bearerToken = tokenJson.access_token;
            apiVersion = tokenJson.apiversion;
            domain = tokenJson.domain;
            expiresTime = tokenJson.expires_in;
            refreshToken = tokenJson.refresh_token;
            scopeValue = tokenJson.scope;
            tokenType = tokenJson.token_type;

            if (errorBearerDiv.classList.contains('show')) {
                errorBearerDiv.classList.remove('show');
                errorBearerDiv.parentElement.classList.add('d-none');
                errorBearerH4.textContent = '';
                errroBearerP.innerHTML = '';
            }


            successBearerDiv.classList.add('show');
            successBearerH4.textContent = "Well done!";
            successBearerP.innerHTML = "Access token: " + bearerToken + "<br>" +
                "Expires in: " + expiresTime + "<br>" +
                "Scope: " + scopeValue + "<br>" +
                "Token Type: " + tokenType + "<br>" +
                "Refresh Token: " + refreshToken + "<br>" +
                "Domain: " + domain + "<br>" +
                "Api Version: " + apiVersion;
            successBearerDiv.parentElement.classList.remove('d-none');
            //let classesDiv = divBearer.classList; 
            enableTabs();
        } catch (error) {
            //divBearer.textContent = error.message + " " + bearer;           
            errorBearerH4.textContent = "Houston, We have a problem!";
            errroBearerP.textContent = bearer;
            errorBearerDiv.classList.add('show');
            errorBearerDiv.parentElement.classList.remove('d-none');
        }
    }
}

/**
 * Glues/call all the previous functions to trigger the HTTP POST request for obtaining the phones. 
 * Since the answer is obtained as TXT, it tries to parse it as JSON and depending on the answer 
 * it will update the corresponding alert (success/failure). On sucess, it will call a function to show
 * the statistics of the phones obtained.
 * 
 * If the reply from the API was successful (you got the phones from the domain), then it will enable the 
 * buttons to show, and reboot the phones. 
 */
async function getPhones() {
    if (formReboot.checkValidity() === true) {
        //If there are sip nodes buttons added from previous clicks, remove the buttons
        if (sipNodes.length !== 0) {
            for (let i = 0; i < sipNodes.length; i++) {
                const element = sipNodes[i];
                let sipNodeClass = element.replace(/\-|\./gi, '');
                let tmpHtmlNodes = document.querySelectorAll(`.${sipNodeClass}`);
                console.log(tmpHtmlNodes);
                tmpHtmlNodes.forEach(element => {
                    element.remove();
                });

            }

        }
        //Json Object with additional values to get the phones from selected domain
        let extraValues = { "format": "json", "object": "device", "action": "read" };
        let formData = getValuesFromForm(formReboot, extraValues);
        let httpPostParam = setHttpPostParameters(actionUrl, formData, 1);
        let phonesJson = await sendPostRequest(httpPostParam);
        //console.log(phonesJson);        

        try {
            // phonesAllJsonObject = JSON.parse(JSON.stringify(phones));
            phonesAllJsonObject = JSON.parse(phonesJson);
            let stats = getPhoneStats(phonesAllJsonObject);
            if (errorActionDiv.classList.contains('show')) {
                errorActionDiv.classList.remove('show');
                errorActionDiv.parentElement.classList.add('d-none');
                errorActionH4.textContent = '';
                errorActionP.innerHTML = '';
            }

            successActionH4.textContent = "Congratulations!";
            successActionP.innerHTML = stats;
            sucessActionDiv.classList.add('show');
            sucessActionDiv.parentElement.classList.remove('d-none');
            enableRebootShowPhonesButtons();
        } catch (error) {
            errorActionH4.textContent = "Houston, We have a problem!";
            errorActionP.textContent = error;
            errorActionDiv.classList.add('show');
            errorActionDiv.parentElement.classList.remove('d-none');
        }

    }

}

/**
 * It will extract some basic information from the JSON returned by the API.
 * It will create other JS Objects with a subset of devices from the main object.
 * It will check the different SIP node where the phones are registered to,
 * and with that information it will create button on the fly that allows showing/rebooting
 * the phones registered on that specific node. 
 */
function getPhoneStats(phones) {
    //Get registered devices from all the devices returned by the API call
    phonesRegJsonObject = phones.filter(reg => reg.mode === 'registered_endpoint');
    phonesSupJsonObject = phonesRegJsonObject.filter(ph => ph.model);
    sipNodes = [phonesSupJsonObject[0].hostname];
    //Get the list of nodes
    phonesSupJsonObject.forEach(function (item, index, array) {
        //console.log(item);
        let tmpNode = item.hostname;
        if (!sipNodes.includes(tmpNode)) {
            sipNodes.push(tmpNode);
        }
    });

    //Create an array of arrays with the phones per SIP node
    for (let i = 0; i < sipNodes.length; i++) {
        phonesByNodeArray[i] = phonesRegJsonObject.filter(node => node.hostname === sipNodes[i]);
    }

    //Call the function to add the show and reboot buttons per SIP node.
    addSipNodesButtons(sipNodes);


    //console.log(sipNodes);
    return "You retrieved " + phonesAllJsonObject.length + " devices" + "<br>" +
        "There are " + phonesRegJsonObject.length + " devices registered" + "<br>" +
        "There are " + phonesSupJsonObject.length + " supported phones registered" + "<br>" +
        "SIP nodes in use: " + sipNodes.toString();
}

/**
 * Takes the list of sip nodes where the phones are registered and create/attach buttons to the DOM.
 *
 * @param {Array} sipNodesData - Array with the list of SIP nodes names (e.g. nms7-atl.dialtoen.com).
 */
function addSipNodesButtons(sipNodesData) {
    for (let i = 0; i < sipNodesData.length; i++) {
        const element = sipNodesData[i];
        let sipNodeClass = element.replace(/\-|\./gi, '');
        sipNodesClassArray[i] = sipNodeClass;
        //console.log(sipNodeClass);

        //Add the radio button to show phones by node
        let tmpLabel = document.createElement('label');
        let tmpInput = document.createElement('input');

        tmpLabel.classList.add('btn', 'btn-success', sipNodeClass);
        tmpInput.setAttribute('type', 'radio');
        tmpInput.setAttribute('name', 'options5');
        tmpInput.setAttribute('autocomplete', 'off');
        tmpLabel.textContent = element;

        tmpLabel.appendChild(tmpInput);
        tmpLabel.addEventListener('click', function () { showHidePhones(1, phonesByNodeArray[i]); });

        showSupportedPhones.parentNode.insertBefore(tmpLabel, showSupportedPhones.nextElementSibling);

        //Add the button to reboot phones by node

        let tmpButton = document.createElement('button');
        tmpButton.setAttribute('type', 'button');
        tmpButton.classList.add('btn', 'btn-danger', sipNodeClass);
        tmpButton.setAttribute('data-toggle', 'modal');
        tmpButton.setAttribute('data-target', '#rebootModal');
        tmpButton.textContent = element;

        tmpButton.addEventListener('click', function (e) {

            selectedButtonForModal = e.currentTarget;

            let modalTitle = `You are about to reboot all the phones registered at ${sipNodesData[i]}`;
            let modalBody = "Do you want to reboot " + phonesByNodeArray[i].length + " devices?" + "<br> <br>" +
                "Please note that this might include: SIP trunks, conference extensions, softphones, not supported phones (They might ignore the checksync SIP packet that we are about to sent)." + "<br> <br>" + "You can check the list of phones with the \"Show Phones\" buttons.";

            labelModalReboot.textContent = modalTitle;
            bodyModalReboot.innerHTML = modalBody;

            selectedPhones = 0;
        });

        rebootSupported.parentNode.insertBefore(tmpButton, rebootSupported.nextElementSibling);
    }
}

/**
 * It will add/remove information in the HTML table to display the phones retrieved from the API.
 * @param {number} action - Controls what to do.  0 = hide phones.
 * @param {object} phones - JS Object with the phones to display in the HTML table. 
 */
function showHidePhones(action, phones = 0) {

    if (action === 0) {
        //If table has content then remove it
        if (phonesTable.childElementCount > 1) {
            phonesTable.lastElementChild.remove();
        }
    } else {

        let tbodyVar = document.createElement('tbody');
        tbodyVar.classList.add('displayedPhones');

        phones.forEach(function (item, index, array) {

            let trVar = document.createElement('tr');
            let tdIndexVar = document.createElement('td');
            let tdAorVar = document.createElement('td');
            let tdNodeVar = document.createElement('td');
            let tdIpVar = document.createElement('td');
            let tdRegTimeVar = document.createElement('td');
            let tdRegExpVar = document.createElement('td');
            let tdScopeVar = document.createElement('td');
            let tdAgentVar = document.createElement('td');

            //CheckBoxButton
            let checkBoxBtnDiv = document.createElement('div');
            let checkBoxBtnInp = document.createElement('input');
            let checkBoxBtnLabel = document.createElement('label');
            checkBoxBtnDiv.classList.add('custom-control', 'custom-checkbox');
            checkBoxBtnInp.setAttribute('type', 'checkbox');
            checkBoxBtnInp.classList.add('custom-control-input');
            checkBoxBtnInp.setAttribute('id', 'phone' + index);

            checkBoxBtnLabel.classList.add('custom-control-label');
            checkBoxBtnLabel.setAttribute('for', 'phone' + index);
            checkBoxBtnLabel.textContent = index;
            checkBoxBtnDiv.appendChild(checkBoxBtnInp);
            checkBoxBtnDiv.appendChild(checkBoxBtnLabel);
            tdIndexVar.appendChild(checkBoxBtnDiv);

            tdAorVar.textContent = item.aor;
            tdNodeVar.textContent = item.hostname;
            tdIpVar.textContent = item.received_from;
            tdRegTimeVar.textContent = item.registration_time;
            tdRegExpVar.textContent = item.registration_expires_time;
            tdScopeVar.textContent = item.sub_scope;
            tdAgentVar.textContent = item.user_agent;

            trVar.appendChild(tdIndexVar);
            trVar.appendChild(tdNodeVar);
            trVar.appendChild(tdAorVar);
            trVar.appendChild(tdIpVar);
            trVar.appendChild(tdRegTimeVar);
            trVar.appendChild(tdRegExpVar);
            trVar.appendChild(tdScopeVar);
            trVar.appendChild(tdAgentVar);

            tbodyVar.appendChild(trVar);
        });

        //If table has content then remove it
        if (phonesTable.childElementCount > 1) {
            phonesTable.lastElementChild.remove();
            phonesTable.appendChild(tbodyVar);
        } else {
            phonesTable.appendChild(tbodyVar);
        }
    }
}

/**
 * It wil set the correct information for the pop-up alert (modal) that allows confirming the action.
 * @param {Array} button - Array with all the html values/information for the pressed button (the one that will trigger the confirmation dialog)
 */

function showRebootPhoneConfirmationDialog(buttonVar) {
    selectedButtonForModal = buttonVar;

    if (buttonVar.classList.contains('rebootSupportedBtn')) {

        let modalTitle = "Reboot the supported phones";
        let modalBody = `Do you want to reboot ${phonesSupJsonObject.length} phones?`;
        labelModalReboot.textContent = modalTitle;
        bodyModalReboot.textContent = modalBody;

        //selectedPhones = 0;

    } else if (buttonVar.classList.contains('rebootRegisteredBtn')) {

        let modalTitle = "Reboot the Registered phones";
        let modalBody = "Do you want to reboot " + phonesRegJsonObject.length + " devices?" + "<br> <br>" +
            "Please note that this might include: SIP trunks, conference extensions, softphones, not supported phones (They might ignore the checksync SIP packet that we are about to sent)." + "<br> <br>" + "You can check the list of phones with the \"Show Phones\" buttons.";

        labelModalReboot.textContent = modalTitle;
        bodyModalReboot.innerHTML = modalBody;

        //selectedPhones = 0;

    } else if (buttonVar.classList.contains('rebootAllBtn')) {

        let modalTitle = "Think twice!";
        let modalBody = "Do you really want to reboot " + phonesAllJsonObject.length + " devices?" + "<br> <br>" +
            "Please note that this will include devices which are <strong>NOT</strong> registered." + "<br> <br>" + "Additionally, it may include SIP trunks, conference extensions, softphones, not supported phones (They might ignore the checksync SIP packet that we are about to sent)." + "<br>" + "<strong>If I was you I would not do it!</strong>" + "<br> <br>" + "You can check the list of phones with the \"Show Phones\" buttons.";
        labelModalReboot.textContent = modalTitle;
        bodyModalReboot.innerHTML = modalBody;

        //selectedPhones = 0;

    } else if (buttonVar.classList.contains('rebootSelectedBtn')) {

        selectedPhones = document.querySelectorAll('.displayedPhones tr div input:checked');

        if (selectedPhones.length === 0) {
            let modalTitle = "Really amigo?";
            let modalBody = "Did you press the button to reboot <strong>0</strong> phones?" + "<br> <br>" + "There must be something wrong with you ;)";
            labelModalReboot.textContent = modalTitle;
            bodyModalReboot.innerHTML = modalBody;

        } else {
            let modalTitle = "Reboot the selected phones";
            let modalBody = `Do you want to reboot ${selectedPhones.length} selected phones?`;
            labelModalReboot.textContent = modalTitle;
            bodyModalReboot.textContent = modalBody;
        }


    }

    //console.log(buttonVar);
}

/**
 * Glues/call all the previous functions to trigger AJAX to send check-sync signal to choosen phones.
 * After lanching the POST request, it will call a function that show the progress. 
 * @param {string} phoneElement - the AOR string.
 * @param {number} index - Index of the current phone in the list of all the phones to be rebooted. 
 * @param {number} total - Total number of phones to reboot. 
 */
async function rebootPhones(phoneElement, index, total) {
    console.log(`Rebooting phone ${phoneElement}`);
    let extraValues = { "object": "device", "action": "update", "device": phoneElement, "check-sync": "yes" };
    let formData = getValuesFromForm(0, extraValues);
    let httpPostParam = setHttpPostParameters(actionUrl, formData, 1);
    let result = await sendPostRequest(httpPostParam);
    console.log(result);
    showRebootProgress(index, total, phoneElement);

}


/**
 * Updates the alert (div) with the phone for which the http request towards the API is sent.
 * @param {number} index - Index of the current phone in the list of all the phones to be rebooted.  
 * @param {number} total - Total number of phones to reboot. 
 * @param {string} phoneAor - the AOR string.
 */
function showRebootProgress(index, phonesTotal, phoneAor) {
    progressActionH4.textContent = `Let's do it! (${index} out of ${phonesTotal})`;
    progressActionP.innerHTML = "We just sent the API request to send a check-sync SIP packet to the device: <strong>" + phoneAor + "</strong>";
    progressActionDiv.classList.add('show');
    progressActionDiv.parentElement.classList.remove('d-none');

    if (index === phonesTotal) {
        setTimeout(function () {
            progressActionDiv.classList.remove('show');
            progressActionDiv.parentElement.classList.add('d-none');
        }, 5000);

    }

}

/**
 * It wil be called on load of the webpage. 
 * It takes the list of all the forms in the webpage and will disable the submit so JS will take over.
 * It will add the class was-validated to prevent the form to show error because there is not information
 * inserted in the mandatory field.
 */
function controlForms() {

    for (let i = 0; i < formsVar.length; i++) {
        const element = formsVar[i];
        element.onsubmit = function (e) {
            e.preventDefault();
            //To prevent the form to show on read once the webpage loads
            formsVar[i].classList.add('was-validated');
        }
    }
    //Debug
    //enableTabs();
    //console.log(formsVar);
}


/**
 * Once a token is received from the API then it will enable the tabs to perform actions like reboot phones and so on.
 */
function enableTabs() {
    for (let i = 0; i < tabsVar.length; i++) {
        const element = tabsVar[i];
        //Enable the tabs for actions
        if (element.classList.contains('disabled')) {
            element.classList.remove('disabled');
        }

        //For the first tab set the active class
        if (i === 0) {
            if (!element.classList.contains('active')) {
                element.classList.add('active');
            }
            //For the first tab enable the reboot form
            if (rebootFormVar.disabled) {
                rebootFormVar.disabled = false;
            }
        }

    }
}

/**
 * Once phones are retrieved via the API. The button to execute
 * actions over the phones retrieved are enabled. 
 */
function enableRebootShowPhonesButtons() {
    for (let i = 0; i < showPhonesButtonsVar.length; i++) {
        let element = showPhonesButtonsVar[i];
        //Enable the tabs for actions
        if (element.classList.contains('disabled')) {
            element.classList.remove('disabled');
        }
    }

    for (let j = 0; j < rebootPhonesButtonsVar.length; j++) {
        let element2 = rebootPhonesButtonsVar[j];

        //Add event listener
        element2.addEventListener('click', function (e) { showRebootPhoneConfirmationDialog(e.currentTarget); });
        //Enable the tabs for actions
        if (element2.disabled) {
            element2.disabled = false;
        }
    }
}


////////////CONTACTS/////////////
/**
 * Glue/call the previous functions to retrieve the contacts via HTTP POST.
 * Since the answer is obtained as TXT, it tries to parse it as JSON and depending on the answer 
 * it will update the corresponding alert (success/failure). 
 * 
 * If the reply from the API was successful (you got the contacts from the domain), then it will enable the 
 * buttons to show, and delete the contacts. 
 */
async function getContacts() {
    if (formContacts.checkValidity() === true) {
        let contactsJson;

        //Check if extension was not entered
        if (extension.value.length === 0) {
            //Send extra value for POST in order to retrieve contacts
            let extraValues = { "format": "json", "object": "contact", "action": "read", 'user': 'domain' };
            let formData = getValuesFromForm(formContacts, extraValues);
            let httpPostParam = setHttpPostParameters(actionUrl, formData, 1);
            contactsJson = await sendPostRequest(httpPostParam);

        } else { //Extension was entered
            //Send extra value for POST in order to retrieve contacts
            let extraValues = { "format": "json", "object": "contact", "action": "read" };
            let formData = getValuesFromForm(formContacts, extraValues);
            let httpPostParam = setHttpPostParameters(actionUrl, formData, 1);
            contactsJson = await sendPostRequest(httpPostParam);
        }

        //let contactsJsonString = JSON.stringify(contactsJson);
        //console.log(contactsJson); 

        //Check if the Json object is empty
        if (JSON.stringify(contactsJson) === '"[]"') {

            errorActionH4.textContent = "Houston, We have a problem!";
            errorActionP.innerHTML = "The API returned an empty JSON Object: " + contactsJson + "<br>" +
                "Are you sure you entered a valid domain?" + "<br>" + "Are you sure the domain/PBX has contacts?";
            errorActionDiv.classList.add('show');
            errorActionDiv.parentElement.classList.remove('d-none');



        } else {
            try {

                contactsAllJsonObject = JSON.parse(contactsJson);

                if (errorActionDiv.classList.contains('show')) {
                    errorActionDiv.classList.remove('show');
                    errorActionDiv.parentElement.classList.add('d-none');
                    errorActionH4.textContent = '';
                    errorActionP.innerHTML = '';
                }

                if (extension.value.length !== 0) {
                    contactsExtJsonObject = contactsAllJsonObject.filter(contactObj => contactObj.tags === ',post,');
                    successActionH4.textContent = "Congratulations!";
                    successActionP.innerHTML = "You retrieved " + contactsAllJsonObject.length +
                        " contacts in total (domain contacts plus extension contacts), and " + contactsExtJsonObject.length +
                        " contacts for extension " + extension.value;
                } else {
                    successActionH4.textContent = "Congratulations!";
                    successActionP.innerHTML = "You retrieved " + contactsAllJsonObject.length + " contacts";
                }

                sucessActionDiv.classList.add('show');
                sucessActionDiv.parentElement.classList.remove('d-none');
                enableDeleteShowContactsButtons();


            } catch (error) {

                errorActionH4.textContent = "Houston, We have a problem!";
                errorActionP.textContent = error;
                errorActionDiv.classList.add('show');
                errorActionDiv.parentElement.classList.remove('d-none');

            }

        }
    }

}
/**
 * It will enalbe the buttons to show contacts
 * It will add the event listener to the delete contacts buttons that will trigger the 
 * confirmation dialog (modal)
 */
function enableDeleteShowContactsButtons() {

    for (let i = 0; i < showContactsButtonsVar.length; i++) {
        let element = showContactsButtonsVar[i];
        //Enable the buttons to show contacts
        if (element.classList.contains('disabled')) {
            element.classList.remove('disabled');
        }
    }

    for (let j = 0; j < deleteContactsButtonsVar.length; j++) {
        let element2 = deleteContactsButtonsVar[j];
        if (element2.classList.contains('deleteExtContactsBtn')) {
            if (extension.value.length !== 0) {

                //Add event listener
                element2.addEventListener('click', function (e) { showDeleteContactsConfirmationDialog(e.currentTarget); });
                //Enable the butto to delete contacts
                if (element2.disabled) {
                    element2.disabled = false;
                }

            } else {
                if (element2.disabled === false) {
                    element2.disabled = true;
                }
            }
        } else {

            //Add event listener
            element2.addEventListener('click', function (e) { showDeleteContactsConfirmationDialog(e.currentTarget); });
            //Enable the butto to delete contacts
            if (element2.disabled) {
                element2.disabled = false;
            }

        }
    }

}

/**
 * It will set the appropiate message for the confirmation dialog according to the pressed button.
 * @param {Array} buttonVar - Array with all the html atttibutes for the pressed button.  
 */
function showDeleteContactsConfirmationDialog(buttonVar) {
    selectedButtonForModal = buttonVar;

    if (buttonVar.classList.contains('deleteAllContactsBtn')) {
        let modalTitle = 'Delete ALL contacts';
        let modalBody = `Do you want to delete ${contactsAllJsonObject.length} contacts?`;
        labelModalReboot.textContent = modalTitle;
        bodyModalReboot.textContent = modalBody;

    } else if (buttonVar.classList.contains('deleteExtContactsBtn')) {
        let modalTitle = 'Delete ALL contacts';
        let modalBody = `Do you want to delete ${contactsExtJsonObject.length} contacts?`;
        labelModalReboot.textContent = modalTitle;
        bodyModalReboot.textContent = modalBody;

    } else if (buttonVar.classList.contains('deleteSelectedContactsBtn')) {
        selectedContacts = document.querySelectorAll('.displayedContacts tr div input:checked');
        if (selectedContacts.length === 0) {
            let modalTitle = "Really amigo?";
            let modalBody = "Did you press the button to delete <strong>0</strong> contacts?" + "<br> <br>" + "There must be something wrong with you ;)";
            labelModalReboot.textContent = modalTitle;
            bodyModalReboot.innerHTML = modalBody;

        } else {
            let modalTitle = 'Delete SELECTED contacts';
            let modalBody = `Do you want to reboot ${selectedContacts.length} selected contacts?`;
            labelModalReboot.textContent = modalTitle;
            bodyModalReboot.textContent = modalBody;
        }
    }


}

/**
 * It will display or hide the contacts obtained from the API in an HTML table.
 * @param {number} action - Controls display or hide. 0 = hide  
 * @param {Object} contacts - Object with all the contacts that will be displayed.  
 */
function showHideContacts(action, contacts = 0) {

    //If action error alert is displayed then remove it
    if (errorActionDiv.classList.contains('show')) {
        errorActionDiv.classList.remove('show');
        errorActionDiv.parentElement.classList.add('d-none');
        errorActionH4.textContent = '';
        errorActionP.innerHTML = '';
    }

    if (action === 0) {
        //If table has content then remove it
        if (contactsTable.childElementCount > 1) {
            contactsTable.lastElementChild.remove();
        }
    } else {

        let tbodyVar = document.createElement('tbody');
        tbodyVar.classList.add('displayedContacts');

        contacts.forEach(function (item, index, array) {

            let trVar = document.createElement('tr');
            let tdIndexVar = document.createElement('td');
            let tdFirstNameVar = document.createElement('td');
            let tdLastNameVar = document.createElement('td');
            let tdWorkVar = document.createElement('td');
            let tdMobileVar = document.createElement('td');
            let tdHomepVar = document.createElement('td');
            let tdFaxVar = document.createElement('td');
            let tdEmailVar = document.createElement('td');
            let tdIdVar = document.createElement('td');

            //CheckBoxButton
            let checkBoxBtnDiv = document.createElement('div');
            let checkBoxBtnInp = document.createElement('input');
            let checkBoxBtnLabel = document.createElement('label');
            checkBoxBtnDiv.classList.add('custom-control', 'custom-checkbox');
            checkBoxBtnInp.setAttribute('type', 'checkbox');
            checkBoxBtnInp.classList.add('custom-control-input');
            checkBoxBtnInp.setAttribute('id', 'contact' + index);

            checkBoxBtnLabel.classList.add('custom-control-label');
            checkBoxBtnLabel.setAttribute('for', 'contact' + index);
            checkBoxBtnLabel.textContent = index;
            checkBoxBtnDiv.appendChild(checkBoxBtnInp);
            checkBoxBtnDiv.appendChild(checkBoxBtnLabel);
            tdIndexVar.appendChild(checkBoxBtnDiv);

            tdFirstNameVar.textContent = item.first_name;
            tdLastNameVar.textContent = item.last_name;
            tdWorkVar.textContent = item.work_phone;
            tdMobileVar.textContent = item.cell_phone;
            tdHomepVar.textContent = item.home_phone;
            tdFaxVar.textContent = item.fax;
            tdEmailVar.textContent = item.email;
            tdIdVar.textContent = item.contact_id;

            trVar.appendChild(tdIndexVar);
            trVar.appendChild(tdFirstNameVar);
            trVar.appendChild(tdLastNameVar);
            trVar.appendChild(tdWorkVar);
            trVar.appendChild(tdMobileVar);
            trVar.appendChild(tdHomepVar);
            trVar.appendChild(tdFaxVar);
            trVar.appendChild(tdEmailVar);
            trVar.appendChild(tdIdVar);

            tbodyVar.appendChild(trVar);
        });

        //If table has content then remove it
        if (contactsTable.childElementCount > 1) {
            contactsTable.lastElementChild.remove();
            contactsTable.appendChild(tbodyVar);
        } else {
            contactsTable.appendChild(tbodyVar);
        }
    }


}

/**
 * It will set all the checkboxes from the contacts displayed on the HTML html to checked. 
 */
function selectAllContacts() {
    contactsCheckbox = document.querySelectorAll('.displayedContacts tr div input');
    if (contactsCheckbox.length === 0) {

        errorActionH4.textContent = "For God's sake!";
        errorActionP.innerHTML = "Really?" + "<br>" +
            "Did you press the button to select all contacts without being displayed? What are you going to select?"
            + "<br>" + "Oh, Common!";
        errorActionDiv.classList.add('show');
        errorActionDiv.parentElement.classList.remove('d-none');

    } else {

        for (let i = 0; i < contactsCheckbox.length; i++) {
            const element = contactsCheckbox[i];
            element.checked = true;
            //console.log(element);

        }

    }

}


/**
 * It will send the POST request to remove the contact with the contactID.
 * @param {number} index - Index of the current contact out of the total to be removed. 
 * @param {number} contactsTotal - Total number of contacts to be removed.  
 * @param {string} contactID - The ID of the contact to be removed.  
 */
async function deleteContact(index, contactsTotal, contactID) {
    console.log(contactID);
    //Send extra value for POST in order to delete a contact
    let extraValues = { "object": "contact", "action": "delete", "contact_id": contactID };
    let formData = getValuesFromForm(formContacts, extraValues);
    let httpPostParam = setHttpPostParameters(actionUrl, formData, 1);
    let requestAnswer = await sendPostRequest(httpPostParam);
    console.log(requestAnswer);
    showDeleteContactProgress(index, contactsTotal, contactID);
}
/**
 * It will update the alert (div) that shows the progress of the contacts removed
 * @param {number} index - Index of the current contact out of the total to be removed. 
 * @param {number} contactsTotal - Total number of contacts to be removed.  
 * @param {string} contactID - The ID of the contact to be removed.  
 */
function showDeleteContactProgress(index, contactsTotal, contactID) {
    progressActionH4.textContent = `Let's do it! (${index} out of ${contactsTotal})`;
    progressActionP.innerHTML = "We just removed contact with ID: <strong>" + contactID + "</strong>";
    progressActionDiv.classList.add('show');
    progressActionDiv.parentElement.classList.remove('d-none');

    if (index === contactsTotal) {
        setTimeout(function () {
            progressActionDiv.classList.remove('show');
            progressActionDiv.parentElement.classList.add('d-none');
        }, 5000);

    }

}


/**
 * This is the main fuction which is applied when  you click the accept (Let's Go)
 * button in the confirmation dialog. Depending on the button that you pressed to trigged the confirmation
 * dialog it will trigger the corresponding action.
 * The method will validate which button was pressed to trigger the confirmation dialog and then it will
 * call the proper function to launch the action.
 */
function validateSelectedButton(selectedBtn) {

    //Logic for rebooting phones
    if (selectedBtn.classList.contains('rebootSupportedBtn')) {
        console.log('Button clicked: Reboot supported phones');

        for (let i = 0; i < phonesSupJsonObject.length; i++) {
            const element = phonesSupJsonObject[i];

            setTimeout(function () {
                rebootPhones(element.aor, i + 1, phonesSupJsonObject.length);
            }, 5000 * i);

        }

    } else if (selectedBtn.classList.contains('rebootRegisteredBtn')) {
        console.log('Button clicked: Reboot Registered phones');
        for (let i = 0; i < phonesRegJsonObject.length; i++) {
            const element = phonesRegJsonObject[i];

            setTimeout(function () {
                rebootPhones(element.aor, i + 1, phonesRegJsonObject.length);
            }, 5000 * i);

        }

    } else if (selectedBtn.classList.contains('rebootAllBtn')) {
        console.log('Button clicked: Reboot All phones');
        for (let i = 0; i < phonesAllJsonObject.length; i++) {
            const element = phonesAllJsonObject[i];

            setTimeout(function () {
                rebootPhones(element.aor, i + 1, phonesAllJsonObject.length);
            }, 5000 * i);

        }

    } else if (selectedBtn.classList.contains('rebootSelectedBtn')) {
        console.log('Button clicked: Reboot selected phones');

        for (let i = 0; i < selectedPhones.length; i++) {
            const element = selectedPhones[i];
            let trElementChildren = element.parentElement.parentElement.parentElement.childNodes;
            let sipAor = trElementChildren.item(2).innerText;

            setTimeout(function () {
                rebootPhones(sipAor, i + 1, selectedPhones.length);
            }, 5000 * i);

        }

    } else if (sipNodesClassArray.length !== 0) { //This one is for the buttons that are automatically added per SIP node
        let classList = selectedBtn.classList;
        let position = sipNodesClassArray.indexOf(classList[classList.length - 1].replace(/\-|\./gi, ''));
        if (position !== -1) {
            console.log(`Button clicked: Reboot ${classList[classList.length - 1]} phones`);

            for (let i = 0; i < phonesByNodeArray[position].length; i++) {
                const element = phonesByNodeArray[position][i];

                setTimeout(function () {
                    rebootPhones(element.aor, i + 1, phonesByNodeArray[position].length);
                }, 5000 * i);

            }

            //console.log(phonesByNodeArray[position]);

            // console.log(selectedBtn);
            // console.log(classList[classList.length-1]);
        }

    }

    //Logic for deleting contacts
    if (selectedBtn.classList.contains('deleteAllContactsBtn')) {
        console.log('Button clicked: Delete All contacts');
        for (let i = 0; i < contactsAllJsonObject.length; i++) {
            const element = contactsAllJsonObject[i].contact_id;
            setTimeout(function () {
                    deleteContact(i + 1, contactsAllJsonObject.length, element);
                }, 100 * i);
            //deleteContact(i + 1, contactsAllJsonObject.length, element);
        }

    } else if (selectedBtn.classList.contains('deleteExtContactsBtn')) {
        console.log('Button clicked: Delete extension contacts');
        for (let i = 0; i < contactsExtJsonObject.length; i++) {
            const element = contactsExtJsonObject[i].contact_id;
            deleteContact(i + 1, contactsExtJsonObject.length, element);
        }

    } else if (selectedBtn.classList.contains('deleteSelectedContactsBtn')) {
        console.log('Button clicked: Delete Selected contacts');
        for (let i = 0; i < selectedContacts.length; i++) {
            const element = selectedContacts[i];
            let trElementChildren = element.parentElement.parentElement.parentElement.childNodes;
            let idContact = trElementChildren.item(8).innerText;
            deleteContact(i + 1, selectedContacts.length, idContact);
        }

    }
}


window.addEventListener('load', controlForms);
tokenForm.addEventListener('submit', getToken);
formReboot.addEventListener('submit', getPhones);
showAllPhones.addEventListener('click', function () { showHidePhones(1, phonesAllJsonObject); });
showRegisteredPhones.addEventListener('click', function () { showHidePhones(1, phonesRegJsonObject); });
showSupportedPhones.addEventListener('click', function () { showHidePhones(1, phonesSupJsonObject); });
hideAllPhones.addEventListener('click', function () { showHidePhones(0); });

//Contacts
formContacts.addEventListener('submit', getContacts);
showAllContacts.addEventListener('click', function () { showHideContacts(1, contactsAllJsonObject); });
selectAllContactsVar.addEventListener('click', function () { selectAllContacts(1); });
hideAllContacts.addEventListener('click', function () { showHideContacts(0); });

//Global modal for action confirmation
doActionModal.addEventListener('click', function () { validateSelectedButton(selectedButtonForModal); });
