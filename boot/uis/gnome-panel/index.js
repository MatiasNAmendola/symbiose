W.UserInterface.current.callLoaded = false;

//On empeche de faire defiler la page
$(document).scroll(function() {
	$('body').scrollTop(0);
});

//Chargement du theme
W.Theme.get(new W.Callback(function(theme) {
	theme.load();
}, function(response) {
	response.triggerError('Impossible de r&eacute;cup&eacute;rer les pr&eacute;f&eacute;rences d\'affichage');
}));

//On definit la hauteur du bureau
var resizeDesktopFn = function() {
	$('#desktop').height($(window).height() - $('#header').outerHeight(true) - $('#footer').outerHeight(true)); //On enleve 50px : 25 * 2 pour les barres haut et bas
	$('#desktop .nautilus').height($(window).height() - $('#header').outerHeight(true) - $('#footer').outerHeight(true)); //On enleve 70px : 25 * 2 pour les barres haut et bas + 20 pour le margin
};
$(window).resize(resizeDesktopFn);

//On cree 2 espaces de travail
var workspaceId = new SWorkspace().id;
new SWorkspace();
SWorkspace.switchTo(workspaceId);

W.User.getLogged(new W.Callback(function(user) {
	//Si l'utilisateur n'est pas connecte, on n'affiche pas son bureau
	if (!user) {
		return;
	}
	
	//On charge le contenu du bureau
	var desktopFiles = $.w.nautilus({
		multipleWindows: true,
		directory: '~/Bureau'
	});
	desktopFiles.one('nautilusreadcomplete', function() {
		$(window).trigger('resize');
	});
	$('#desktop-files').replaceWith(desktopFiles);
}, function() {}));

//On initialise les tableaux de bord
Webos.Dashboard.init();

//On definit la fonction de gestion des erreurs
Webos.Error.setErrorHandler(function(error) {
	var errorWindow = $.webos.window({
		title: 'Erreur',
		resizable: false,
		width: 400,
		icon: new W.Icon('status/error')
	});
	
	var message, details;
	if (error instanceof Webos.Error) {
		message = error.html.message;
		details = error.toString();
	} else {
		message = details = error.name + ' : ' + error.message;
	}
	
	var img = $('<img />', { 'src': new W.Icon('status/error'), 'alt': 'erreur' }).css('float', 'left');
	errorWindow.window('content').append(img);
	
	errorWindow.window('content').append('<strong>Une erreur est survenue.</strong><br />'+message);
	
	var spoiler = $.w.spoiler('D&eacute;tails').appendTo(errorWindow.window('content'));
	
	$('<pre></pre>')
		.html(details)
		.css('height','150px')
		.css('overflow','auto')
		.css('background-color','white')
		.css('padding','2px')
		.appendTo(spoiler.spoiler('content'));
	
	var buttonContainer = $.webos.buttonContainer();
	var closeButton = $.webos.button('Fermer');
	closeButton.click(function() {
		errorWindow.window('close');
	});
	buttonContainer.buttonContainer('content').append(closeButton);
	errorWindow.window('content').append(buttonContainer);
	
	errorWindow.window('open');
});

W.ServerCall.bind('complete', function() {
	resizeDesktopFn();
	W.UserInterface.current.loaded();
});