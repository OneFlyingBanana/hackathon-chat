import React, { useState } from 'react';

// Définition du composant ProfileModal
export default function ProfileModal({ myDid, setShow }) {
  //console.log("My Ddi: " +  myDid)

  // Définition des états du composant
  const [isNamesEditable, setIsNamesEditable] = useState(false) // État pour savoir si le nom est modifiable
  const [names, setNames] = useState("Joanna Baranowska") // État pour stocker le nom
  const [isCopied, setIsCopied] = useState(false) // État pour savoir si le DID a été copié

  // Fonction pour gérer l'appui sur la touche Entrée
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsNamesEditable(false) // Si la touche Entrée est appuyée, rendre le nom non modifiable
    }
  }

  // Fonction pour gérer la copie du DID
  const handleCopy = () => {
    navigator.clipboard.writeText(myDid) // Copier le DID dans le presse-papiers
    setIsCopied(true) // Mettre l'état isCopied à true, mettre à jour l'état pour indiquer que le DID a été copié
    setTimeout(() => {
      setIsCopied(false) // Réinitialiser l'état après 2 secondes
    }, 2000)
  }

  return (
    // Création d'un élément de dialogue modale
    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  {/* // Icone du profil */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                {/* Informations du profil */}
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Account Profil Info</h3>
                  <div className="mt-2 " >
                    {/*  Recuperation du DID */}
                    <p className="text-sm text-gray-500 ">
                      My DID: <span className="break-all bg-gray-100" >{myDid}</span>
                    </p>
                    {/* // Bouton pour copier le DID */}
                    <div onClick={handleCopy} className="flex justify-end" >
                      {/* // Icone de copie */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                    </div>
                  </div>
                  {/* // Conteneur pour le nom et le bouton d'édition */}
                  <div className="mt-2  flex justify-between" >
                    {isNamesEditable ? (
                      // Champ de saisie pour le nom avec autofocus, gestion de l'appui sur la touche Entrée et mise à jour de l'état
                      <input autoFocus onKeyDown={handleKeyDown} onChange={(e) => setNames(e.target.value)} type="text" value={names} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                    ) : (
                      // Affichage du nom avec un gestionnaire de clic pour rendre le nom modifiable
                      <p onClick={() => setIsNamesEditable(true)} className="text-sm text-gray-500">
                        {names}
                      </p>)
                    }
                  </div>
                  {/* // Si le DID a été copié, afficher une alerte */}
                  {isCopied && (
                    <div class="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3" role="alert">
                      <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z" /></svg>
                      <p>Text copié.</p>
                    </div>
                  )}

                </div>
              </div>
            </div>
            {/* // Conteneur pour les boutons "Cancel" et "Ok" */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                onClick={() => setShow(false)}
                type="button" className="inline-flex w-20 justify-center rounded-md bg-red-100 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 ">Cancel</button>
              <button
                onClick={() => setShow(false)}
                type="button" className="mt-3 inline-flex w-20  justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 ">Ok</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
